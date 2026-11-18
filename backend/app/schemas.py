"""Wire models. Field names here are the contract the front end is written against."""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    name: str = Field(min_length=1, max_length=120)


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=200)


class UserOut(BaseModel):
    id: str
    email: str
    name: str
    created_at: datetime


class TokenOut(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int
    user: UserOut


class ConversationOut(BaseModel):
    id: str
    title: str
    pinned: bool
    created_at: datetime
    updated_at: datetime


class MessageOut(BaseModel):
    id: str
    role: Literal["user", "model"]
    text: str
    ordinal: int
    created_at: datetime


class ConversationDetail(ConversationOut):
    messages: list[MessageOut]


class ConversationPage(BaseModel):
    items: list[ConversationOut]
    next_cursor: str | None = None


class ConversationCreate(BaseModel):
    title: str = Field(default="", max_length=200)


class ConversationPatch(BaseModel):
    title: str | None = Field(default=None, max_length=200)
    pinned: bool | None = None


class MessageIn(BaseModel):
    text: str = Field(min_length=1, max_length=8000)
    model: str = Field(default="auto", max_length=32)
    stream: bool = False


class MessagePair(BaseModel):
    user_message: MessageOut
    model_message: MessageOut


class ModelOut(BaseModel):
    id: str
    label: str
    description: str
    locked: bool = False
    thinking_levels: list[str] = []


class SettingsOut(BaseModel):
    theme: Literal["system", "light", "dark"]
    default_model: str
    task_mode: Literal["chat", "task"]
    memory_enabled: bool


class SettingsPatch(BaseModel):
    theme: Literal["system", "light", "dark"] | None = None
    default_model: str | None = Field(default=None, max_length=32)
    task_mode: Literal["chat", "task"] | None = None
    memory_enabled: bool | None = None


class SearchItem(BaseModel):
    conversation_id: str
    title: str
    snippet: str
    updated_at: datetime


class SearchOut(BaseModel):
    query: str
    items: list[SearchItem]


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorOut(BaseModel):
    error: ErrorBody
