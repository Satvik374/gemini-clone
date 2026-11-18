"""Password hashing and stateless tokens, written for this service.

scrypt from the standard library for passwords; an HMAC-SHA256 signed payload for
tokens (no third-party JWT library, no borrowed token format).
"""

import base64
import hashlib
import hmac
import json
import os
import secrets
import time

TOKEN_TTL = int(os.environ.get("TOKEN_TTL_SECONDS", str(60 * 60 * 24 * 7)))
_KEY = os.environ.get("TOKEN_SECRET", "").encode("utf-8") or secrets.token_bytes(32)

_SCRYPT = {"n": 2**14, "r": 8, "p": 1, "dklen": 32}


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode("utf-8"), salt=salt, **_SCRYPT)
    return "scrypt${}${}".format(salt.hex(), digest.hex())


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, salt_hex, digest_hex = stored.split("$")
    except ValueError:
        return False
    if scheme != "scrypt":
        return False
    digest = hashlib.scrypt(password.encode("utf-8"), salt=bytes.fromhex(salt_hex), **_SCRYPT)
    return hmac.compare_digest(digest, bytes.fromhex(digest_hex))


def _b64(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("ascii")


def _unb64(text: str) -> bytes:
    return base64.urlsafe_b64decode(text + "=" * (-len(text) % 4))


def issue_token(user_id: str, ttl: int | None = None) -> tuple[str, int]:
    expires_in = TOKEN_TTL if ttl is None else ttl
    payload = {"sub": user_id, "exp": int(time.time()) + expires_in}
    body = _b64(json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8"))
    sig = _b64(hmac.new(_KEY, body.encode("ascii"), hashlib.sha256).digest())
    return f"{body}.{sig}", expires_in


def read_token(token: str) -> str | None:
    """Return the subject, or None when the token is malformed, forged or expired."""
    try:
        body, sig = token.split(".")
    except (ValueError, AttributeError):
        return None
    expected = _b64(hmac.new(_KEY, body.encode("ascii"), hashlib.sha256).digest())
    if not hmac.compare_digest(sig, expected):
        return None
    try:
        payload = json.loads(_unb64(body))
    except (ValueError, json.JSONDecodeError):
        return None
    if not isinstance(payload, dict) or int(payload.get("exp", 0)) < time.time():
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None
