"""Contract tests written from recon/openapi.yaml, not from the implementation."""

import json

from conftest import auth_headers


def test_health(client):
    res = client.get("/v1/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"


def test_models_and_suggestions(client):
    models = client.get("/v1/models").json()
    assert [m["id"] for m in models][:2] == ["auto", "fast"]
    assert all({"id", "label", "description", "locked", "thinking_levels"} <= set(m) for m in models)
    suggestions = client.get("/v1/suggestions").json()
    assert isinstance(suggestions, list) and all(isinstance(s, str) for s in suggestions)


def test_missing_token_is_401_envelope(client):
    res = client.get("/v1/conversations")
    assert res.status_code == 401
    assert res.json() == {"error": {"code": "unauthenticated", "message": res.json()["error"]["message"]}}


def test_forged_token_is_401(client):
    res = client.get("/v1/conversations", headers={"Authorization": "Bearer not.a-token"})
    assert res.status_code == 401


def test_register_and_duplicate(client):
    body = {"email": "new.person@example.com", "password": "hunter2-hunter2", "name": "New Person"}
    created = client.post("/v1/auth/register", json=body)
    assert created.status_code == 201
    payload = created.json()
    assert payload["token_type"] == "bearer" and payload["access_token"]
    assert payload["user"]["email"] == "new.person@example.com"

    again = client.post("/v1/auth/register", json=body)
    assert again.status_code == 409
    assert again.json()["error"]["code"] == "email_taken"


def test_register_validation_envelope(client):
    res = client.post("/v1/auth/register", json={"email": "not-an-email", "password": "x", "name": ""})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "invalid_request"


def test_bad_password_is_401(client):
    res = client.post("/v1/auth/token", json={"email": "demo@example.com", "password": "wrong-password"})
    assert res.status_code == 401
    assert res.json()["error"]["code"] == "unauthenticated"


def test_me(client):
    headers = auth_headers(client)
    res = client.get("/v1/me", headers=headers)
    assert res.status_code == 200
    assert res.json()["email"] == "demo@example.com"


def test_conversation_crud_and_detail(client):
    headers = auth_headers(client)
    created = client.post("/v1/conversations", json={"title": "A fresh chat"}, headers=headers)
    assert created.status_code == 201
    convo = created.json()
    assert convo["title"] == "A fresh chat" and convo["pinned"] is False

    listed = client.get("/v1/conversations", headers=headers).json()
    assert any(item["id"] == convo["id"] for item in listed["items"])

    patched = client.patch(
        f"/v1/conversations/{convo['id']}", json={"title": "Renamed", "pinned": True}, headers=headers
    )
    assert patched.status_code == 200
    assert patched.json()["title"] == "Renamed" and patched.json()["pinned"] is True

    detail = client.get(f"/v1/conversations/{convo['id']}", headers=headers).json()
    assert detail["messages"] == []

    deleted = client.delete(f"/v1/conversations/{convo['id']}", headers=headers)
    assert deleted.status_code == 204
    assert client.get(f"/v1/conversations/{convo['id']}", headers=headers).status_code == 404


def test_pagination_cursor(client):
    headers = auth_headers(client)
    for index in range(3):
        client.post("/v1/conversations", json={"title": f"Page test {index}"}, headers=headers)
    first = client.get("/v1/conversations?limit=2", headers=headers).json()
    assert len(first["items"]) == 2 and first["next_cursor"] is not None
    second = client.get(f"/v1/conversations?limit=2&cursor={first['next_cursor']}", headers=headers).json()
    assert second["items"]
    ids = {item["id"] for item in first["items"]} & {item["id"] for item in second["items"]}
    assert ids == set()


def test_message_pair_and_title_from_prompt(client):
    headers = auth_headers(client)
    convo = client.post("/v1/conversations", json={}, headers=headers).json()
    res = client.post(
        f"/v1/conversations/{convo['id']}/messages",
        json={"text": "Explain a merge conflict", "model": "auto"},
        headers=headers,
    )
    assert res.status_code == 200
    pair = res.json()
    assert pair["user_message"]["role"] == "user" and pair["user_message"]["ordinal"] == 0
    assert pair["model_message"]["role"] == "model" and pair["model_message"]["ordinal"] == 1
    assert pair["user_message"]["text"] == "Explain a merge conflict"

    detail = client.get(f"/v1/conversations/{convo['id']}", headers=headers).json()
    assert detail["title"] == "Explain a merge conflict"
    assert [m["role"] for m in detail["messages"]] == ["user", "model"]


def test_message_stream_frames(client):
    headers = auth_headers(client)
    convo = client.post("/v1/conversations", json={"title": "Stream"}, headers=headers).json()
    with client.stream(
        "POST",
        f"/v1/conversations/{convo['id']}/messages",
        json={"text": "Stream this please", "stream": True},
        headers=headers,
    ) as res:
        assert res.status_code == 200
        assert res.headers["content-type"].startswith("text/event-stream")
        body = "".join(res.iter_text())
    assert body.count("event: delta") >= 1
    assert "event: done" in body
    done = [line for line in body.splitlines() if line.startswith("data: ")][-1]
    assert "reconstructed backend" in json.loads(done[len("data: ") :])["text"]


def test_empty_message_rejected(client):
    headers = auth_headers(client)
    convo = client.post("/v1/conversations", json={}, headers=headers).json()
    res = client.post(f"/v1/conversations/{convo['id']}/messages", json={"text": ""}, headers=headers)
    assert res.status_code == 422


def test_other_users_conversation_is_hidden(client):
    owner = client.post(
        "/v1/auth/register",
        json={"email": "other@example.com", "password": "another-password", "name": "Other"},
    ).json()
    other_headers = {"Authorization": f"Bearer {owner['access_token']}"}
    convo = client.post("/v1/conversations", json={"title": "Private"}, headers=other_headers).json()

    mine = auth_headers(client)
    assert client.get(f"/v1/conversations/{convo['id']}", headers=mine).status_code == 404
    assert client.delete(f"/v1/conversations/{convo['id']}", headers=mine).status_code == 404


def test_search_by_title_and_body(client):
    headers = auth_headers(client)
    by_title = client.get("/v1/search?q=Weeknight", headers=headers).json()
    assert by_title["items"] and by_title["items"][0]["title"] == "Weeknight dinner rotation"

    by_body = client.get("/v1/search?q=lentil", headers=headers).json()
    assert by_body["items"] and by_body["items"][0]["snippet"]


def test_settings_read_and_patch(client):
    headers = auth_headers(client)
    initial = client.get("/v1/settings", headers=headers).json()
    assert initial["theme"] == "system" and initial["default_model"] == "auto"

    patched = client.patch("/v1/settings", json={"theme": "dark", "task_mode": "task"}, headers=headers)
    assert patched.status_code == 200
    assert patched.json()["theme"] == "dark" and patched.json()["task_mode"] == "task"

    bad = client.patch("/v1/settings", json={"theme": "midnight"}, headers=headers)
    assert bad.status_code == 422
