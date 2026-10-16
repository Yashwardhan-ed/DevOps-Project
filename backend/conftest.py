import os
import pytest
from fastapi.testclient import TestClient

# Use SQLite in-memory for tests — no PostgreSQL needed
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from app.main import app  # noqa: E402 — import after env override


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def created_ticket(client):
    """Create a ticket once and share across tests."""
    resp = client.post(
        "/api/tickets",
        json={
            "title": "Login page is broken",
            "description": "Users cannot log in via SSO",
            "priority": "HIGH",
            "assignee": "Support Agent",
        },
    )
    assert resp.status_code == 201
    return resp.json()
