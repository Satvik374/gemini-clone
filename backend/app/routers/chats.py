"""Conversation, message and search endpoints, scoped to the signed-in user."""

import json
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..deps import current_user
from ..errors import not_found
from ..models import Conversation, Message, User
from ..schemas import (
    ConversationCreate,
    ConversationDetail,
    ConversationOut,
    ConversationPage,
    ConversationPatch,
    MessageIn,
    MessageOut,
    MessagePair,
    SearchItem,
    SearchOut,
)
from ..services.replies import reply_for, stream_chunks

router = APIRouter(prefix="/v1", tags=["conversations"])

TITLE_FROM_PROMPT = 60


def _owned(db: Session, user: User, conversation_id: str) -> Conversation:
    convo = db.get(Conversation, conversation_id)
    # Another user's conversation is reported as absent, never as forbidden.
    if convo is None or convo.user_id != user.id:
        raise not_found("Conversation")
    return convo


def _out(convo: Conversation) -> ConversationOut:
    return ConversationOut(
        id=convo.id,
        title=convo.title,
        pinned=convo.pinned,
        created_at=convo.created_at,
        updated_at=convo.updated_at,
    )


def _msg_out(msg: Message) -> MessageOut:
    return MessageOut(
        id=msg.id,
        role=msg.role,
        text=msg.text,
        ordinal=msg.ordinal,
        created_at=msg.created_at,
    )


def _messages(db: Session, conversation_id: str) -> list[Message]:
    return list(
        db.scalars(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.ordinal.asc())
        )
    )


@router.get("/conversations", response_model=ConversationPage, openapi_extra={"x-provenance": "INFERRED"})
def list_conversations(
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None, description="Offset cursor returned as next_cursor"),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> ConversationPage:
    offset = 0
    if cursor:
        try:
            offset = max(0, int(cursor))
        except ValueError:
            offset = 0
    rows = list(
        db.scalars(
            select(Conversation)
            .where(Conversation.user_id == user.id)
            .order_by(Conversation.pinned.desc(), Conversation.updated_at.desc(), Conversation.id.desc())
            .offset(offset)
            .limit(limit + 1)
        )
    )
    page = rows[:limit]
    next_cursor = str(offset + limit) if len(rows) > limit else None
    return ConversationPage(items=[_out(c) for c in page], next_cursor=next_cursor)


@router.post(
    "/conversations",
    response_model=ConversationOut,
    status_code=status.HTTP_201_CREATED,
    openapi_extra={"x-provenance": "INFERRED"},
)
def create_conversation(
    body: ConversationCreate,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> ConversationOut:
    convo = Conversation(id=uuid4().hex, user_id=user.id, title=body.title.strip())
    db.add(convo)
    db.commit()
    db.refresh(convo)
    return _out(convo)


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationDetail,
    openapi_extra={"x-provenance": "INFERRED"},
)
def read_conversation(
    conversation_id: str,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> ConversationDetail:
    convo = _owned(db, user, conversation_id)
    base = _out(convo)
    return ConversationDetail(
        **base.model_dump(),
        messages=[_msg_out(m) for m in _messages(db, convo.id)],
    )


@router.patch(
    "/conversations/{conversation_id}",
    response_model=ConversationOut,
    openapi_extra={"x-provenance": "INFERRED"},
)
def patch_conversation(
    conversation_id: str,
    body: ConversationPatch,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> ConversationOut:
    convo = _owned(db, user, conversation_id)
    if body.title is not None:
        convo.title = body.title.strip()
    if body.pinned is not None:
        convo.pinned = body.pinned
    convo.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(convo)
    return _out(convo)


@router.delete(
    "/conversations/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    openapi_extra={"x-provenance": "INFERRED"},
)
def delete_conversation(
    conversation_id: str,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> Response:
    convo = _owned(db, user, conversation_id)
    for msg in _messages(db, convo.id):
        db.delete(msg)
    db.delete(convo)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def _sse(text: str) -> list[str]:
    frames = []
    for chunk in stream_chunks(text):
        frames.append("event: delta\ndata: " + json.dumps({"text": chunk}) + "\n\n")
    frames.append("event: done\ndata: " + json.dumps({"text": text}) + "\n\n")
    return frames


@router.post(
    "/conversations/{conversation_id}/messages",
    response_model=MessagePair,
    openapi_extra={"x-provenance": "INFERRED"},
)
def post_message(
    conversation_id: str,
    body: MessageIn,
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
):
    convo = _owned(db, user, conversation_id)
    history = _messages(db, convo.id)
    ordinal = history[-1].ordinal + 1 if history else 0

    user_msg = Message(
        id=uuid4().hex,
        conversation_id=convo.id,
        role="user",
        text=body.text,
        ordinal=ordinal,
    )
    reply_text = reply_for(body.text)
    model_msg = Message(
        id=uuid4().hex,
        conversation_id=convo.id,
        role="model",
        text=reply_text,
        ordinal=ordinal + 1,
    )
    db.add(user_msg)
    db.add(model_msg)
    if not convo.title:
        convo.title = body.text.strip().splitlines()[0][:TITLE_FROM_PROMPT]
    convo.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user_msg)
    db.refresh(model_msg)

    pair = MessagePair(user_message=_msg_out(user_msg), model_message=_msg_out(model_msg))
    if body.stream:
        return StreamingResponse(
            iter(_sse(reply_text)),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
        )
    return pair


@router.get("/search", response_model=SearchOut, openapi_extra={"x-provenance": "INFERRED"})
def search(
    q: str = Query(min_length=1, max_length=200),
    limit: int = Query(20, ge=1, le=50),
    user: User = Depends(current_user),
    db: Session = Depends(get_db),
) -> SearchOut:
    needle = f"%{q.strip().lower()}%"
    convo_hits = list(
        db.scalars(
            select(Conversation)
            .where(
                Conversation.user_id == user.id,
                func.lower(Conversation.title).like(needle),
            )
            .order_by(Conversation.updated_at.desc())
            .limit(limit)
        )
    )
    seen = {c.id for c in convo_hits}
    items = [
        SearchItem(conversation_id=c.id, title=c.title or "Untitled chat", snippet="", updated_at=c.updated_at)
        for c in convo_hits
    ]

    if len(items) < limit:
        msg_hits = db.execute(
            select(Message, Conversation)
            .join(Conversation, Conversation.id == Message.conversation_id)
            .where(
                Conversation.user_id == user.id,
                func.lower(Message.text).like(needle),
            )
            .order_by(Conversation.updated_at.desc())
            .limit(limit * 2)
        ).all()
        for msg, convo in msg_hits:
            if convo.id in seen:
                continue
            snippet = msg.text.strip().replace("\n", " ")[:120]
            items.append(
                SearchItem(
                    conversation_id=convo.id,
                    title=convo.title or "Untitled chat",
                    snippet=snippet,
                    updated_at=convo.updated_at,
                )
            )
            seen.add(convo.id)
            if len(items) >= limit:
                break

    return SearchOut(query=q, items=items[:limit])
