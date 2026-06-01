import json

from app.config import Settings
from app.llm_client import LLMClient


class FakeResponse:
    status_code = 200
    text = ""

    def json(self) -> dict:
        return {
            "model": "test-model",
            "output_text": "Provider response",
            "choices": [
                {
                    "message": {
                        "content": "OpenRouter provider response",
                    }
                }
            ],
            "candidates": [
                {
                    "content": {
                        "parts": [{"text": "Gemini provider response"}],
                    }
                }
            ],
        }


class FakeHttpClient:
    calls: list[dict] = []

    def __init__(self, timeout: float) -> None:
        self.timeout = timeout

    def __enter__(self) -> "FakeHttpClient":
        return self

    def __exit__(self, *_: object) -> None:
        return None

    def post(self, endpoint: str, headers: dict, json: dict) -> FakeResponse:
        self.calls.append({"endpoint": endpoint, "headers": headers, "json": json})
        return FakeResponse()


class FakeStreamResponse:
    status_code = 200
    text = (
        'data: {"model":"9router","choices":[{"delta":{"content":"Xin "}}]}\n\n'
        'data: {"model":"9router","choices":[{"delta":{"content":"chao"}}]}\n\n'
        "data: [DONE]\n\n"
    )

    def json(self) -> dict:
        raise json.JSONDecodeError("Extra data", self.text, 0)


class FakeStreamHttpClient(FakeHttpClient):
    def post(self, endpoint: str, headers: dict, json: dict) -> FakeStreamResponse:
        self.calls.append({"endpoint": endpoint, "headers": headers, "json": json})
        return FakeStreamResponse()


class FakeMixedStreamResponse:
    status_code = 200
    text = (
        '{"model":"9router","choices":[{"message":{"content":"Xin chao"}}]}\n'
        "data: [DONE]\n\n"
    )

    def json(self) -> dict:
        raise json.JSONDecodeError("Extra data", self.text, 0)


class FakeMixedStreamHttpClient(FakeHttpClient):
    def post(self, endpoint: str, headers: dict, json: dict) -> FakeMixedStreamResponse:
        self.calls.append({"endpoint": endpoint, "headers": headers, "json": json})
        return FakeMixedStreamResponse()


def test_llm_client_calls_openai_responses_api(monkeypatch) -> None:
    FakeHttpClient.calls.clear()
    monkeypatch.setattr("app.llm_client.httpx.Client", FakeHttpClient)

    client = LLMClient(
        Settings(
            llm_api_key="test-key",
            llm_provider="openai",
            llm_model="test-model",
            llm_base_url="https://api.openai.com/v1",
        )
    )

    result = client.complete("system", "user")

    assert result.text == "Provider response"
    assert result.model == "test-model"
    assert FakeHttpClient.calls[0]["endpoint"] == "https://api.openai.com/v1/responses"
    assert FakeHttpClient.calls[0]["headers"]["Authorization"] == "Bearer test-key"
    assert FakeHttpClient.calls[0]["json"] == {
        "model": "test-model",
        "instructions": "system",
        "input": "user",
    }


def test_llm_client_calls_gemini_generate_content_api(monkeypatch) -> None:
    FakeHttpClient.calls.clear()
    monkeypatch.setattr("app.llm_client.httpx.Client", FakeHttpClient)

    client = LLMClient(
        Settings(
            llm_api_key="test-key",
            llm_provider="gemini",
            llm_model="gemini-2.5-flash",
            llm_base_url="https://generativelanguage.googleapis.com/v1beta",
        )
    )

    result = client.complete("system", "user")

    assert result.text == "Gemini provider response"
    assert result.model == "gemini-2.5-flash"
    assert result.provider == "gemini"
    assert FakeHttpClient.calls[0]["endpoint"] == (
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    )
    assert FakeHttpClient.calls[0]["headers"]["x-goog-api-key"] == "test-key"
    assert FakeHttpClient.calls[0]["json"] == {
        "systemInstruction": {
            "parts": [{"text": "system"}],
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": "user"}],
            }
        ],
    }


def test_llm_client_calls_openrouter_chat_completions_api(monkeypatch) -> None:
    FakeHttpClient.calls.clear()
    monkeypatch.setattr("app.llm_client.httpx.Client", FakeHttpClient)

    client = LLMClient(
        Settings(
            llm_api_key="test-key",
            llm_provider="openrouter",
            llm_model="openrouter/auto",
            llm_base_url="https://openrouter.ai/api/v1",
        )
    )

    result = client.complete("system", "user")

    assert result.text == "OpenRouter provider response"
    assert result.provider == "openrouter"
    assert FakeHttpClient.calls[0]["endpoint"] == "https://openrouter.ai/api/v1/chat/completions"
    assert FakeHttpClient.calls[0]["headers"]["Authorization"] == "Bearer test-key"
    assert FakeHttpClient.calls[0]["json"] == {
        "model": "openrouter/auto",
        "messages": [
            {"role": "system", "content": "system"},
            {"role": "user", "content": "user"},
        ],
    }


def test_llm_client_accepts_9router_alias(monkeypatch) -> None:
    FakeHttpClient.calls.clear()
    monkeypatch.setattr("app.llm_client.httpx.Client", FakeHttpClient)

    client = LLMClient(
        Settings(
            llm_api_key="test-key",
            llm_provider="9router",
            llm_model="openrouter/auto",
            llm_base_url="https://openrouter.ai/api/v1",
        )
    )

    result = client.complete("system", "user")

    assert result.text == "OpenRouter provider response"
    assert result.provider == "9router"


def test_llm_client_reads_9router_stream_response(monkeypatch) -> None:
    FakeStreamHttpClient.calls.clear()
    monkeypatch.setattr("app.llm_client.httpx.Client", FakeStreamHttpClient)

    client = LLMClient(
        Settings(
            llm_api_key="test-key",
            llm_provider="9router",
            llm_model="9router",
            llm_base_url="http://localhost:20128/v1",
        )
    )

    result = client.complete("system", "user")

    assert result.text == "Xin chao"
    assert result.model == "9router"
    assert result.provider == "9router"


def test_llm_client_reads_9router_json_line_stream_response(monkeypatch) -> None:
    FakeMixedStreamHttpClient.calls.clear()
    monkeypatch.setattr("app.llm_client.httpx.Client", FakeMixedStreamHttpClient)

    client = LLMClient(
        Settings(
            llm_api_key="test-key",
            llm_provider="9router",
            llm_model="9router",
            llm_base_url="http://localhost:20128/v1",
        )
    )

    result = client.complete("system", "user")

    assert result.text == "Xin chao"
    assert result.model == "9router"
    assert result.provider == "9router"
