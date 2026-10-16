"""
Helpdesk API — Test Suite
Covers: health, root, ready, CRUD (create/list/get/update/delete), stats, 404.
Run: pytest -v
"""


def test_health(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json() == {"status": "UP"}


def test_root(client):
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["service"] == "Helpdesk API"
    assert data["docs"] == "/docs"


def test_ready(client):
    resp = client.get("/ready")
    assert resp.status_code == 200
    assert resp.json() == {"status": "READY"}


def test_create_ticket(client, created_ticket):
    assert created_ticket["title"] == "Login page is broken"
    assert created_ticket["priority"] == "HIGH"
    assert created_ticket["status"] == "OPEN"
    assert "id" in created_ticket
    assert "created_at" in created_ticket


def test_list_tickets(client, created_ticket):
    resp = client.get("/api/tickets")
    assert resp.status_code == 200
    tickets = resp.json()
    assert isinstance(tickets, list)
    assert len(tickets) >= 1
    ids = [t["id"] for t in tickets]
    assert created_ticket["id"] in ids


def test_get_ticket(client, created_ticket):
    ticket_id = created_ticket["id"]
    resp = client.get(f"/api/tickets/{ticket_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == ticket_id
    assert resp.json()["title"] == "Login page is broken"


def test_update_ticket(client, created_ticket):
    ticket_id = created_ticket["id"]
    resp = client.put(
        f"/api/tickets/{ticket_id}",
        json={"status": "IN_PROGRESS", "assignee": "Senior Engineer"},
    )
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["status"] == "IN_PROGRESS"
    assert updated["assignee"] == "Senior Engineer"


def test_stats(client, created_ticket):
    resp = client.get("/api/tickets/stats")
    assert resp.status_code == 200
    data = resp.json()
    assert "total" in data
    assert "open" in data
    assert "inProgress" in data
    assert "resolved" in data
    assert "closed" in data
    assert data["total"] >= 1


def test_delete_ticket(client, created_ticket):
    ticket_id = created_ticket["id"]
    resp = client.delete(f"/api/tickets/{ticket_id}")
    assert resp.status_code == 204


def test_ticket_not_found(client):
    resp = client.get("/api/tickets/999999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "Ticket not found"
