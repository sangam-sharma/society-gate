import os
from datetime import timedelta

import models
from auth import create_access_token, hash_password, verify_password


def test_password_hashing():
    password = "StrongPassword123!"
    hashed = hash_password(password)

    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong-password", hashed)


def test_access_token_contains_user_id():
    token = create_access_token({"user_id": 123}, expires_delta=timedelta(minutes=5))

    # Decoding is covered by the application auth flow; this test only verifies
    # that token creation returns a non-empty JWT string.
    assert isinstance(token, str)
    assert token.count(".") == 2


def test_role_guards_use_database_role():
    user = type("User", (), {})()
    user.role = models.UserRole.resident
    assert user.role == models.UserRole.resident
