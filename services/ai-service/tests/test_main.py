from fastapi.testclient import TestClient

from app.main import app
from app.rag import FALLBACK_ANSWER


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_menu_chat_uses_controlled_fallback_without_context() -> None:
    response = client.post(
        "/api/v1/ai/menu-chat",
        json={"question": "Đi 4 người khoảng 600k nên gọi món gì?"},
    )

    assert response.status_code == 200
    assert response.json() == {
        "success": True,
        "data": {"answer": FALLBACK_ANSWER, "sources": []},
    }


def test_recommend_combo_keeps_contract_fields() -> None:
    response = client.post(
        "/api/v1/ai/recommend-combo",
        json={
            "numberOfPeople": 4,
            "budget": 600000,
            "preferences": ["không quá cay", "có trẻ em"],
        },
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["answer"] == FALLBACK_ANSWER
    assert data["sources"] == []
    assert data["numberOfPeople"] == 4
    assert data["budget"] == 600000


def test_manager_report_uses_controlled_fallback() -> None:
    response = client.post("/api/v1/ai/manager-report", json={"date": "2026-06-01"})

    assert response.status_code == 200
    assert response.json()["data"]["summary"] == FALLBACK_ANSWER


def test_rebuild_index_returns_index_metadata() -> None:
    response = client.post("/api/v1/ai/rebuild-index")

    assert response.status_code == 200
    assert "indexedDocuments" in response.json()["data"]
