from fastapi.testclient import TestClient

from app.llm_client import LLMProviderError, LLMResult
from app.main import app, llm_client


client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert "providerConfigured" in response.json()


def test_menu_chat_uses_llm_provider(monkeypatch) -> None:
    monkeypatch.setattr(
        llm_client,
        "complete",
        lambda *_: LLMResult("AI đã gọi provider thật.", "test-model", "openai"),
    )

    response = client.post(
        "/api/v1/ai/menu-chat",
        json={"question": "Đi 4 người khoảng 600k nên gọi món gì?"},
    )

    assert response.status_code == 200
    data = response.json()["data"]
    assert data["answer"] == "AI đã gọi provider thật."
    assert data["provider"] == "openai"
    assert data["model"] == "test-model"


def test_recommend_combo_keeps_contract_fields(monkeypatch) -> None:
    monkeypatch.setattr(
        llm_client,
        "complete",
        lambda *_: LLMResult("Combo do LLM sinh.", "test-model", "openai"),
    )

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
    assert data["answer"] == "Combo do LLM sinh."
    assert data["numberOfPeople"] == 4
    assert data["budget"] == 600000
    assert data["provider"] == "openai"


def test_manager_report_uses_llm_provider(monkeypatch) -> None:
    monkeypatch.setattr(
        llm_client,
        "complete",
        lambda *_: LLMResult("Báo cáo do LLM sinh.", "test-model", "openai"),
    )

    response = client.post("/api/v1/ai/manager-report", json={"date": "2026-06-01"})

    assert response.status_code == 200
    assert response.json()["data"]["summary"] == "Báo cáo do LLM sinh."


def test_provider_error_returns_contract_response(monkeypatch) -> None:
    def raise_provider_error(*_) -> None:
        raise LLMProviderError("AI_SERVICE_UNAVAILABLE", "Missing API key.")

    monkeypatch.setattr(llm_client, "complete", raise_provider_error)

    response = client.post("/api/v1/ai/menu-chat", json={"question": "Có món chay không?"})

    assert response.status_code == 503
    assert response.json()["success"] is False
    assert response.json()["error"]["code"] == "AI_SERVICE_UNAVAILABLE"


def test_rebuild_index_returns_index_metadata() -> None:
    response = client.post("/api/v1/ai/rebuild-index")

    assert response.status_code == 200
    assert "indexedDocuments" in response.json()["data"]
