from __future__ import annotations

import json
import unittest
from pathlib import Path
from types import SimpleNamespace as Namespace
from unittest.mock import Mock, patch

from fastapi.testclient import TestClient

from auth_service.main import ACCESS_COOKIE, QUALIFICATION_NQF_LEVELS, app, profile_response

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "learner_profile.json").read_text())


class ProfileLogicTests(unittest.TestCase):
    def test_south_african_nqf_mapping(self):
        self.assertEqual(QUALIFICATION_NQF_LEVELS["Grade 9"], 1)
        self.assertEqual(QUALIFICATION_NQF_LEVELS["Matric"], 4)
        self.assertEqual(QUALIFICATION_NQF_LEVELS["N6 certificate"], 5)
        self.assertEqual(QUALIFICATION_NQF_LEVELS["Diploma"], 6)
        self.assertEqual(QUALIFICATION_NQF_LEVELS["Doctorate"], 10)

    def test_profile_fixture_is_complete_and_math_literacy_is_explicit(self):
        result = profile_response(FIXTURE)
        self.assertEqual(result.nqf_level, 4)
        self.assertEqual(result.strength, 100)
        self.assertEqual(result.profile.subjects[0].name, "Mathematics Literacy")
        self.assertEqual(result.profile.subjects[0].mark, 78)
        self.assertEqual(result.profile.skill_ratings[0].source, "self_reported")
        self.assertEqual(result.profile.experience_by_area[0].months, 4)

    def test_empty_profile_does_not_infer_eligibility(self):
        result = profile_response(None)
        self.assertEqual(result.strength, 0)
        self.assertIsNone(result.nqf_level)
        self.assertIn("highest qualification", result.next_step)


class SupabaseRouteTests(unittest.TestCase):
    def setUp(self):
        self.user = Namespace(
            id="00000000-0000-0000-0000-000000000001",
            email="learner@example.com",
            user_metadata={"name": "Sample Learner"},
        )
        self.session = Namespace(access_token="sample-access", refresh_token="sample-refresh", expires_in=3600)
        self.query = Mock()
        self.query.select.return_value = self.query
        self.query.eq.return_value = self.query
        self.query.maybe_single.return_value = self.query
        self.query.execute.return_value = Namespace(data=None)
        self.client = Namespace(
            auth=Namespace(
                sign_up=Mock(return_value=Namespace(user=self.user, session=self.session)),
                sign_in_with_password=Mock(return_value=Namespace(user=self.user, session=self.session)),
                get_user=Mock(return_value=Namespace(user=self.user)),
                set_session=Mock(),
                sign_out=Mock(),
            ),
            postgrest=Namespace(auth=Mock()),
            table=Mock(return_value=self.query),
            rpc=Mock(return_value=self.query),
        )
        self.client_patch = patch("auth_service.main.get_supabase", return_value=self.client)
        self.client_patch.start()
        self.browser = TestClient(app)

    def tearDown(self):
        self.client_patch.stop()
        self.browser.close()

    def test_signup_sets_http_only_session_and_profile_endpoint_reads_user(self):
        response = self.browser.post("/auth-api/signup", json={
            "name": "Sample Learner",
            "email": "learner@example.com",
            "password": "a-long-sample-passphrase",
            "privacy_consent": True,
        })
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.cookies.get(ACCESS_COOKIE))
        cookie_header = response.headers.get_list("set-cookie")
        self.assertTrue(any("HttpOnly" in cookie for cookie in cookie_header))

        current = self.browser.get("/auth-api/me")
        self.assertEqual(current.status_code, 200)
        self.assertEqual(current.json()["user"]["email"], "learner@example.com")

    def test_signup_requires_privacy_consent(self):
        response = self.browser.post("/auth-api/signup", json={
            "name": "Sample Learner",
            "email": "learner@example.com",
            "password": "a-long-sample-passphrase",
        })
        self.assertEqual(response.status_code, 400)
        self.client.auth.sign_up.assert_not_called()

    def test_profile_upsert_is_scoped_to_authenticated_user(self):
        response = self.browser.put("/auth-api/profile", json=FIXTURE, cookies={ACCESS_COOKIE: "sample-access"})
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(response.json()["nqf_level"], 4)
        saved_row = self.client.table.call_args[0][0]
        self.assertEqual(saved_row, "learner_profiles")
        self.query.upsert.assert_called_once()
        self.assertEqual(self.query.upsert.call_args.args[0]["user_id"], self.user.id)

    def test_admin_requires_allowlisted_email(self):
        with patch.dict("os.environ", {"ADMIN_EMAILS": "admin@example.com"}):
            denied = self.browser.get("/auth-api/admin/me", cookies={ACCESS_COOKIE: "sample-access"})
            self.assertEqual(denied.status_code, 403)
            self.user.email = "admin@example.com"
            allowed = self.browser.get("/auth-api/admin/me", cookies={ACCESS_COOKIE: "sample-access"})
            self.assertEqual(allowed.status_code, 200)
            self.assertTrue(allowed.json()["user"]["is_admin"])

    def test_notification_preferences_are_opt_in_by_default(self):
        response = self.browser.get("/auth-api/notification-preferences", cookies={ACCESS_COOKIE: "sample-access"})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["preferences"]["weekly_digest"])

    def test_export_returns_only_the_authenticated_users_data(self):
        response = self.browser.get("/auth-api/export", cookies={ACCESS_COOKIE: "sample-access"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["account"]["id"], self.user.id)
        self.assertIn("learner_profiles", [call.args[0] for call in self.client.table.call_args_list])
        self.assertIn("attachment;", response.headers["content-disposition"])

    def test_delete_account_calls_user_scoped_rpc(self):
        response = self.browser.delete("/auth-api/account", cookies={ACCESS_COOKIE: "sample-access"})
        self.assertEqual(response.status_code, 204)
        self.client.postgrest.auth.assert_called_with("sample-access")
        self.client.rpc.assert_called_once_with("delete_my_account")


if __name__ == "__main__":
    unittest.main()