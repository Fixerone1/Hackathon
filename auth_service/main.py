from __future__ import annotations

import os
import time
from functools import lru_cache
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel, EmailStr, Field
from supabase import Client, create_client

load_dotenv()

ACCESS_COOKIE = "careerforge_access"
REFRESH_COOKIE = "careerforge_refresh"


class SignupPayload(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=12, max_length=128)


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PublicUser(BaseModel):
    id: str
    name: str
    email: str


class AuthResponse(BaseModel):
    user: PublicUser
    confirmation_required: bool = False


class ChecklistPayload(BaseModel):
    items: list[str] = Field(max_length=50)


class FailureLimiter:
    def __init__(self, max_attempts: int, window_seconds: int) -> None:
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self.failures: dict[str, list[float]] = {}

    def check(self, key: str) -> None:
        now = time.monotonic()
        attempts = [at for at in self.failures.get(key, []) if now - at < self.window_seconds]
        self.failures[key] = attempts
        if len(attempts) >= self.max_attempts:
            raise HTTPException(status_code=429, detail="Too many attempts. Please try again later.")

    def fail(self, key: str) -> None:
        self.failures.setdefault(key, []).append(time.monotonic())

    def clear(self, key: str) -> None:
        self.failures.pop(key, None)


login_limiter = FailureLimiter(max_attempts=8, window_seconds=15 * 60)
signup_limiter = FailureLimiter(max_attempts=5, window_seconds=60 * 60)


@lru_cache(maxsize=1)
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_ANON_KEY")
    if not url or not key:
        raise HTTPException(status_code=503, detail="Authentication is not configured.")
    return create_client(url, key)


def client_key(request: Request) -> str:
    return request.client.host if request.client else "unknown"


def issue_session(session: Any, response: Response) -> None:
    secure = os.getenv("AUTH_COOKIE_SECURE", "false").lower() == "true"
    response.set_cookie(
        key=ACCESS_COOKIE,
        value=session.access_token,
        max_age=session.expires_in,
        httponly=True,
        secure=secure,
        samesite="lax",
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE,
        value=session.refresh_token,
        max_age=60 * 60 * 24 * 30,
        httponly=True,
        secure=secure,
        samesite="lax",
        path="/",
    )


def current_user(request: Request, response: Response) -> tuple[Any, str]:
    access_token = request.cookies.get(ACCESS_COOKIE)
    refresh_token = request.cookies.get(REFRESH_COOKIE)
    if not access_token:
        raise HTTPException(status_code=401, detail="Authentication required.")

    client = get_supabase()
    try:
        user = client.auth.get_user(access_token).user
        return user, access_token
    except Exception:
        if not refresh_token:
            raise HTTPException(status_code=401, detail="Authentication required.") from None

    try:
        refreshed = client.auth.refresh_session(refresh_token)
        if not refreshed.session:
            raise HTTPException(status_code=401, detail="Authentication required.")
        issue_session(refreshed.session, response)
        return refreshed.user, refreshed.session.access_token
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Authentication required.") from None


def public_user(user: Any) -> PublicUser:
    metadata = user.user_metadata or {}
    return PublicUser(
        id=str(user.id),
        name=metadata.get("name") or (user.email or "Learner").split("@", 1)[0],
        email=user.email or "",
    )


app = FastAPI(title="CareerForge Authentication", docs_url=None, redoc_url=None)


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth-api/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupPayload, request: Request, response: Response) -> AuthResponse:
    key = client_key(request)
    signup_limiter.check(key)
    client = get_supabase()
    try:
        result = client.auth.sign_up({
            "email": str(payload.email).strip().lower(),
            "password": payload.password,
            "options": {"data": {"name": payload.name.strip()}},
        })
    except Exception:
        signup_limiter.fail(key)
        raise HTTPException(status_code=400, detail="Unable to create this account. Check the details or sign in.") from None

    signup_limiter.clear(key)
    if not result.user:
        raise HTTPException(status_code=400, detail="Unable to create this account. Please try again.")
    if result.session:
        issue_session(result.session, response)
    return AuthResponse(user=public_user(result.user), confirmation_required=result.session is None)


@app.post("/auth-api/login", response_model=AuthResponse)
def login(payload: LoginPayload, request: Request, response: Response) -> AuthResponse:
    key = client_key(request)
    login_limiter.check(key)
    client = get_supabase()
    try:
        result = client.auth.sign_in_with_password({
            "email": str(payload.email).strip().lower(),
            "password": payload.password,
        })
    except Exception:
        login_limiter.fail(key)
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")

    if not result.user or not result.session:
        login_limiter.fail(key)
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")

    login_limiter.clear(key)
    issue_session(result.session, response)
    return AuthResponse(user=public_user(result.user))


@app.get("/auth-api/me", response_model=AuthResponse)
def get_current_user(request: Request, response: Response) -> AuthResponse:
    user, _ = current_user(request, response)
    return AuthResponse(user=public_user(user))


@app.post("/auth-api/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(request: Request, response: Response) -> None:
    access_token = request.cookies.get(ACCESS_COOKIE)
    refresh_token = request.cookies.get(REFRESH_COOKIE)
    if access_token and refresh_token:
        try:
            client = get_supabase()
            client.auth.set_session(access_token, refresh_token)
            client.auth.sign_out({"scope": "local"})
        except Exception:
            pass
    response.delete_cookie(key=ACCESS_COOKIE, path="/", httponly=True, samesite="lax")
    response.delete_cookie(key=REFRESH_COOKIE, path="/", httponly=True, samesite="lax")


@app.get("/auth-api/checklist", response_model=ChecklistPayload)
def get_checklist(request: Request, response: Response) -> ChecklistPayload:
    user, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    try:
        result = client.table("learner_progress").select("checklist").eq("user_id", user.id).maybe_single().execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Learner data storage is not available.") from None
    return ChecklistPayload(items=(result.data or {}).get("checklist", []))


@app.put("/auth-api/checklist", response_model=ChecklistPayload)
def save_checklist(payload: ChecklistPayload, request: Request, response: Response) -> ChecklistPayload:
    user, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    try:
        client.table("learner_progress").upsert(
            {"user_id": user.id, "checklist": payload.items},
            on_conflict="user_id",
        ).execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Learner data storage is not available.") from None
    return payload


static_dir = Path(os.getenv("STATIC_SITE_DIR", "out"))
if static_dir.is_dir():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="site")