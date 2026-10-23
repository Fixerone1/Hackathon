from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Any, Literal
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Request, Response, status
from fastapi.responses import JSONResponse
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
    privacy_consent: bool = False


class LoginPayload(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PublicUser(BaseModel):
    id: str
    name: str
    email: str
    is_admin: bool = False


class AuthResponse(BaseModel):
    user: PublicUser
    confirmation_required: bool = False


class ChecklistPayload(BaseModel):
    items: list[str] = Field(max_length=50)


class SubjectResult(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    mark: int | None = Field(default=None, ge=0, le=100)


class ExperienceEntry(BaseModel):
    area: str = Field(min_length=1, max_length=100)
    months: int = Field(ge=0, le=600)


class SkillRating(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    level: int = Field(ge=1, le=5)
    source: Literal["self_reported"] = "self_reported"
    evidence_note: str = Field(default="", max_length=240)


class ProfilePayload(BaseModel):
    highest_qualification: str = Field(default="", max_length=80)
    qualification_status: Literal["", "in_progress", "completed"] = ""
    field_of_study: str = Field(default="", max_length=120)
    qualification_year: int | None = Field(default=None, ge=1950, le=2100)
    subjects: list[SubjectResult] = Field(default_factory=list, max_length=20)
    skills: list[str] = Field(default_factory=list, max_length=40)
    experience_months: int = Field(default=0, ge=0, le=600)
    experience_by_area: list[ExperienceEntry] = Field(default_factory=list, max_length=20)
    skill_ratings: list[SkillRating] = Field(default_factory=list, max_length=40)
    province: Literal[
        "", "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
        "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape",
    ] = ""
    city: str = Field(default="", max_length=100)
    target_role: str = Field(default="", max_length=120)
    target_income_monthly: int | None = Field(default=None, ge=0, le=1_000_000)
    hours_available_per_week: int | None = Field(default=None, ge=0, le=168)
    employment_status: Literal[
        "", "unemployed", "student", "employed_looking", "self_employed",
    ] = ""
    age_band: Literal["", "under_18", "18_24", "25_34", "35_plus"] = ""
    languages: list[str] = Field(default_factory=list, max_length=12)
    drivers_license: bool | None = None
    willing_to_relocate: bool | None = None
    remote_ok: bool | None = None
    own_transport: bool | None = None
    computer_or_data_access: bool | None = None


class NotificationPreferences(BaseModel):
    instant_matches: bool = False
    weekly_digest: bool = False
    closing_reminders: bool = False
    frequency: Literal["weekly", "instant"] = "weekly"
    quiet_hours_start: str = Field(default="20:00", pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    quiet_hours_end: str = Field(default="08:00", pattern=r"^([01]\d|2[0-3]):[0-5]\d$")
    paused: bool = False


class NotificationResponse(BaseModel):
    preferences: NotificationPreferences


class ProfileResponse(BaseModel):
    profile: ProfilePayload
    nqf_level: int | None
    strength: int
    next_step: str


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
    admin_emails = {
        email.strip().lower()
        for email in os.getenv("ADMIN_EMAILS", "").split(",")
        if email.strip()
    }
    return PublicUser(
        id=str(user.id),
        name=metadata.get("name") or (user.email or "Learner").split("@", 1)[0],
        email=user.email or "",
        is_admin=(user.email or "").lower() in admin_emails,
    )


QUALIFICATION_NQF_LEVELS = {
    "Below Grade 9": 1,
    "Grade 9": 1,
    "Grade 10": 2,
    "Grade 11": 3,
    "Matric": 4,
    "N6 certificate": 5,
    "Diploma": 6,
    "Bachelor's degree": 7,
    "Honours degree": 8,
    "Master's degree": 9,
    "Doctorate": 10,
}


def profile_response(data: dict[str, Any] | None) -> ProfileResponse:
    profile = ProfilePayload.model_validate(data or {})
    completed_fields = [
        bool(profile.highest_qualification),
        bool(profile.field_of_study),
        bool(profile.subjects),
        bool(profile.skills or profile.skill_ratings),
        profile.experience_months > 0,
        bool(profile.province),
        bool(profile.target_role),
    ]
    strength = round(sum(completed_fields) * 100 / len(completed_fields))
    next_step = "Complete your profile to improve future opportunity matching."
    if not profile.highest_qualification:
        next_step = "Add your highest qualification to begin your profile."
    elif not profile.subjects and profile.highest_qualification in {"Matric", "Grade 10", "Grade 11"}:
        next_step = "Add your subjects to clarify eligibility for future opportunities."
    elif not profile.province:
        next_step = "Add your province to identify relevant local opportunities."
    elif not profile.target_role:
        next_step = "Add a target role to make your profile more useful."
    elif not profile.skills:
        next_step = "Add your skills to improve future opportunity matching."
    return ProfileResponse(
        profile=profile,
        nqf_level=QUALIFICATION_NQF_LEVELS.get(profile.highest_qualification),
        strength=strength,
        next_step=next_step,
    )


app = FastAPI(title="CareerForge Authentication", docs_url=None, redoc_url=None)


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth-api/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupPayload, request: Request, response: Response) -> AuthResponse:
    key = client_key(request)
    signup_limiter.check(key)
    if not payload.privacy_consent:
        raise HTTPException(status_code=400, detail="Please agree to the privacy notice before creating an account.")
    client = get_supabase()
    try:
        result = client.auth.sign_up({
            "email": str(payload.email).strip().lower(),
            "password": payload.password,
            "options": {"data": {
                "name": payload.name.strip(),
                "privacy_consent_at": datetime.now(timezone.utc).isoformat(),
            }},
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


@app.get("/auth-api/admin/me", response_model=AuthResponse)
def get_admin_user(request: Request, response: Response) -> AuthResponse:
    user, _ = current_user(request, response)
    result = public_user(user)
    if not result.is_admin:
        raise HTTPException(status_code=403, detail="Admin access is not enabled for this account.")
    return AuthResponse(user=result)


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


@app.get("/auth-api/profile", response_model=ProfileResponse)
def get_profile(request: Request, response: Response) -> ProfileResponse:
    user, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    try:
        result = client.table("learner_profiles").select("*").eq("user_id", user.id).maybe_single().execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Profile storage is not available.") from None
    return profile_response(result.data)


@app.put("/auth-api/profile", response_model=ProfileResponse)
def save_profile(payload: ProfilePayload, request: Request, response: Response) -> ProfileResponse:
    user, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    profile_data = payload.model_dump()
    row = {
        "user_id": user.id,
        **profile_data,
        "nqf_level": QUALIFICATION_NQF_LEVELS.get(payload.highest_qualification),
    }
    try:
        client.table("learner_profiles").upsert(row, on_conflict="user_id").execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Profile storage is not available.") from None
    return profile_response(profile_data)


@app.get("/auth-api/notification-preferences", response_model=NotificationResponse)
def get_notification_preferences(request: Request, response: Response) -> NotificationResponse:
    user, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    try:
        result = client.table("email_preferences").select("*").eq("user_id", user.id).maybe_single().execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Notification settings are not available.") from None
    return NotificationResponse(preferences=NotificationPreferences.model_validate(result.data or {}))


@app.put("/auth-api/notification-preferences", response_model=NotificationResponse)
def save_notification_preferences(
    payload: NotificationPreferences,
    request: Request,
    response: Response,
) -> NotificationResponse:
    user, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    try:
        existing_result = client.table("email_preferences").select("*").eq("user_id", user.id).maybe_single().execute()
        existing = existing_result.data or {}
        consent_timestamp = datetime.now(timezone.utc).isoformat()
        row = {
            "user_id": user.id,
            **payload.model_dump(),
            "instant_matches_consented_at": consent_timestamp if payload.instant_matches and not existing.get("instant_matches") else existing.get("instant_matches_consented_at") if payload.instant_matches else None,
            "weekly_digest_consented_at": consent_timestamp if payload.weekly_digest and not existing.get("weekly_digest") else existing.get("weekly_digest_consented_at") if payload.weekly_digest else None,
            "closing_reminders_consented_at": consent_timestamp if payload.closing_reminders and not existing.get("closing_reminders") else existing.get("closing_reminders_consented_at") if payload.closing_reminders else None,
        }
        client.table("email_preferences").upsert(row, on_conflict="user_id").execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Notification settings could not be saved.") from None
    return NotificationResponse(preferences=payload)


@app.get("/auth-api/export")
def export_user_data(request: Request, response: Response) -> JSONResponse:
    user, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    try:
        exported: dict[str, Any] = {
            "account": {"id": str(user.id), "email": user.email, "name": public_user(user).name},
        }
        for table, columns, key in (
            ("learner_profiles", "*", "profile"),
            ("learner_progress", "*", "progress"),
            ("email_preferences", "*", "email_preferences"),
        ):
            result = client.table(table).select(columns).eq("user_id", user.id).maybe_single().execute()
            exported[key] = result.data
    except Exception:
        raise HTTPException(status_code=503, detail="Your data export could not be prepared.") from None
    return JSONResponse(
        content=exported,
        headers={"Content-Disposition": 'attachment; filename="careerforge-data-export.json"'},
    )


@app.delete("/auth-api/account", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(request: Request, response: Response) -> None:
    _, access_token = current_user(request, response)
    client = get_supabase()
    client.postgrest.auth(access_token)
    try:
        client.rpc("delete_my_account").execute()
    except Exception:
        raise HTTPException(status_code=503, detail="Account deletion is not configured. Apply the privacy migration and try again.") from None
    response.delete_cookie(key=ACCESS_COOKIE, path="/", httponly=True, samesite="lax")
    response.delete_cookie(key=REFRESH_COOKIE, path="/", httponly=True, samesite="lax")


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