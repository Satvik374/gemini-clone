"""Models, suggestions, settings and health."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user
from ..models import Setting, User
from ..schemas import ModelOut, SettingsOut, SettingsPatch

router = APIRouter(prefix="/v1", tags=["meta"])

# Labels are ours: the original's model names are its product naming, not a contract.
MODELS: list[ModelOut] = [
    ModelOut(
        id="auto",
        label="Auto",
        description="Picks a model for the request",
        thinking_levels=["standard", "extended"],
    ),
    ModelOut(id="fast", label="Fast", description="Lowest latency", thinking_levels=["standard"]),
    ModelOut(
        id="reasoning",
        label="Reasoning",
        description="Slower, more thorough",
        thinking_levels=["standard", "extended", "deep"],
    ),
    ModelOut(id="video", label="Video", description="Requires a paid plan", locked=True),
]

SUGGESTIONS: list[str] = [
    "Plan a weeknight dinner rotation",
    "Explain a merge conflict like I am new to git",
    "Turn these notes into a status update",
    "Draft a polite reschedule email",
]


@router.get("/health", openapi_extra={"x-provenance": "INFERRED"})
def health() -> dict:
    return {"status": "ok", "service": "gemini-clone-api"}


@router.get("/models", response_model=list[ModelOut], openapi_extra={"x-provenance": "INFERRED"})
def list_models() -> list[ModelOut]:
    return MODELS


@router.get("/suggestions", response_model=list[str], openapi_extra={"x-provenance": "INFERRED"})
def list_suggestions() -> list[str]:
    return SUGGESTIONS


def _settings_out(row: Setting) -> SettingsOut:
    return SettingsOut(
        theme=row.theme,  # type: ignore[arg-type]
        default_model=row.default_model,
        task_mode=row.task_mode,  # type: ignore[arg-type]
        memory_enabled=row.memory_enabled,
    )


def _settings_row(db: Session, user: User) -> Setting:
    row = db.get(Setting, user.id)
    if row is None:
        row = Setting(user_id=user.id)
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.get("/settings", response_model=SettingsOut, openapi_extra={"x-provenance": "INFERRED"})
def read_settings(user: User = Depends(current_user), db: Session = Depends(get_db)) -> SettingsOut:
    return _settings_out(_settings_row(db, user))


@router.patch("/settings", response_model=SettingsOut, openapi_extra={"x-provenance": "INFERRED"})
def patch_settings(
    body: SettingsPatch,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> SettingsOut:
    row = _settings_row(db, user)
    data = body.model_dump(exclude_unset=True, exclude_none=True)
    for key, value in data.items():
        setattr(row, key, value)
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(row)
    return _settings_out(row)
