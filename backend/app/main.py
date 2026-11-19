"""Application factory, error envelopes and CORS for the cloned front end."""

import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from .db import Base, SessionLocal, engine
from .routers import auth, chats, meta
from .seed import seed_if_empty

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get(
        "ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000"
    ).split(",")
    if origin.strip()
]


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_if_empty(db)
    yield


def create_app() -> FastAPI:
    app = FastAPI(
        title="Gemini app backend (reconstructed)",
        version="0.1.0",
        lifespan=lifespan,
        description=(
            "Clean-room implementation of the API the cloned front end needs. "
            "No endpoint here talks to Google; replies are generated locally."
        ),
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
        expose_headers=["Content-Type"],
    )

    @app.exception_handler(HTTPException)
    async def http_error(request: Request, exc: HTTPException) -> JSONResponse:
        detail = exc.detail
        if isinstance(detail, dict) and "code" in detail:
            body = {"error": {"code": detail["code"], "message": detail.get("message", "")}}
        else:
            body = {"error": {"code": "http_error", "message": str(detail)}}
        return JSONResponse(status_code=exc.status_code, content=body)

    @app.exception_handler(RequestValidationError)
    async def validation_error(request: Request, exc: RequestValidationError) -> JSONResponse:
        first = exc.errors()[0] if exc.errors() else {}
        loc = ".".join(str(part) for part in first.get("loc", []) if part != "body")
        return JSONResponse(
            status_code=422,
            content={
                "error": {
                    "code": "invalid_request",
                    "message": f"{loc or 'request'}: {first.get('msg', 'is invalid')}",
                }
            },
        )

    app.include_router(auth.router)
    app.include_router(chats.router)
    app.include_router(meta.router)

    front_end = Path(__file__).resolve().parents[2] / "clones" / "gemini-google" / "src"
    if front_end.is_dir():
        app.mount("/app", StaticFiles(directory=front_end, html=True), name="app")

        @app.get("/", include_in_schema=False)
        def index() -> RedirectResponse:
            return RedirectResponse(url="/app/")

    return app


app = create_app()
