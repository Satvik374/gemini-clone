"""Request-scoped dependencies: bearer auth and the current user."""

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from .db import get_db
from .errors import unauthenticated
from .models import User
from .security import read_token


def bearer_token(request: Request) -> str:
    header = request.headers.get("authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.lower() != "bearer" or not token.strip():
        raise unauthenticated()
    return token.strip()


def current_user(token: str = Depends(bearer_token), db: Session = Depends(get_db)) -> User:
    subject = read_token(token)
    if not subject:
        raise unauthenticated("Token is malformed, forged or expired")
    user = db.get(User, subject)
    if user is None:
        raise unauthenticated("Token subject no longer exists")
    return user
