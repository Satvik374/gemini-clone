"""Account endpoints: register, sign in, read own profile."""

from uuid import uuid4

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user
from ..errors import conflict, unauthenticated
from ..models import Setting, User
from ..schemas import LoginIn, RegisterIn, TokenOut, UserOut
from ..security import hash_password, issue_token, verify_password

router = APIRouter(prefix="/v1", tags=["auth"])


def _token_response(user: User) -> TokenOut:
    token, expires_in = issue_token(user.id)
    return TokenOut(
        access_token=token,
        expires_in=expires_in,
        user=UserOut(id=user.id, email=user.email, name=user.name, created_at=user.created_at),
    )


@router.post(
    "/auth/register",
    response_model=TokenOut,
    status_code=status.HTTP_201_CREATED,
    openapi_extra={"x-provenance": "INFERRED"},
)
def register(body: RegisterIn, db: Session = Depends(get_db)) -> TokenOut:
    email = body.email.lower()
    existing = db.scalar(select(User).where(User.email == email))
    if existing:
        raise conflict("email_taken", "An account with that email already exists")
    user = User(
        id=uuid4().hex,
        email=email,
        name=body.name.strip(),
        password_hash=hash_password(body.password),
    )
    db.add(user)
    db.add(Setting(user_id=user.id))
    db.commit()
    db.refresh(user)
    return _token_response(user)


@router.post("/auth/token", response_model=TokenOut, openapi_extra={"x-provenance": "INFERRED"})
def sign_in(body: LoginIn, db: Session = Depends(get_db)) -> TokenOut:
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    if user is None or not verify_password(body.password, user.password_hash):
        raise unauthenticated("Email or password is incorrect")
    return _token_response(user)


@router.get("/me", response_model=UserOut, openapi_extra={"x-provenance": "INFERRED"})
def read_me(user: User = Depends(current_user)) -> UserOut:
    return UserOut(id=user.id, email=user.email, name=user.name, created_at=user.created_at)
