"""Error envelope. Machine-readable codes are the contract; wording is ours."""

from fastapi import HTTPException


class ApiError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(status_code=status_code, detail={"code": code, "message": message})


def not_found(what: str = "Resource") -> ApiError:
    return ApiError(404, "not_found", f"{what} does not exist")


def unauthenticated(message: str = "Missing or invalid access token") -> ApiError:
    return ApiError(401, "unauthenticated", message)


def conflict(code: str, message: str) -> ApiError:
    return ApiError(409, code, message)


def invalid(code: str, message: str) -> ApiError:
    return ApiError(400, code, message)
