from dataclasses import dataclass
import json
import os
from typing import Any

import httpx

from app.config import Settings


class LLMProviderError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 503) -> None:
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


@dataclass(frozen=True)
class LLMResult:
    text: str
    model: str
    provider: str


class LLMClient:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def complete(self, system_prompt: str, user_prompt: str) -> LLMResult:
        provider = self.settings.llm_provider.lower()
        if provider == "openai":
            return self._complete_openai(system_prompt, user_prompt)

        if provider == "gemini":
            return self._complete_gemini(system_prompt, user_prompt)

        if provider in {"openrouter", "9router"}:
            return self._complete_chat_completions(system_prompt, user_prompt, provider=provider)

        raise LLMProviderError(
            "AI_SERVICE_UNAVAILABLE",
            f"Provider '{self.settings.llm_provider}' is not supported.",
        )

    def _complete_openai(self, system_prompt: str, user_prompt: str) -> LLMResult:
        api_key = self._api_key()
        endpoint = f"{self.settings.llm_base_url.rstrip('/')}/responses"
        payload = {
            "model": self.settings.llm_model,
            "instructions": system_prompt,
            "input": user_prompt,
        }

        data = self._post_json(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            payload=payload,
        )
        text = _extract_openai_text(data)

        return self._result_from_text(text, data.get("model"), "openai")

    def _complete_gemini(self, system_prompt: str, user_prompt: str) -> LLMResult:
        api_key = self._api_key()
        endpoint = f"{self.settings.llm_base_url.rstrip('/')}/models/{self.settings.llm_model}:generateContent"
        payload = {
            "systemInstruction": {
                "parts": [{"text": system_prompt}],
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}],
                }
            ],
        }

        data = self._post_json(
            endpoint,
            headers={
                "x-goog-api-key": api_key,
                "Content-Type": "application/json",
            },
            payload=payload,
        )
        text = _extract_gemini_text(data)

        return self._result_from_text(text, self.settings.llm_model, "gemini")

    def _api_key(self) -> str:
        api_key = (
            self.settings.llm_api_key
            or os.getenv("OPENROUTER_API_KEY")
            or os.getenv("GEMINI_API_KEY")
            or os.getenv("OPENAI_API_KEY")
        )
        if not api_key:
            raise LLMProviderError(
                "AI_SERVICE_UNAVAILABLE",
                "AI provider API key is not configured. Set AI_SERVICE_LLM_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY.",
            )
        return api_key

    def _complete_chat_completions(self, system_prompt: str, user_prompt: str, provider: str) -> LLMResult:
        api_key = self._api_key()
        endpoint = f"{self.settings.llm_base_url.rstrip('/')}/chat/completions"
        payload = {
            "model": self.settings.llm_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
        }

        data = self._post_json(
            endpoint,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            payload=payload,
        )
        text = _extract_chat_completion_text(data)

        return self._result_from_text(text, data.get("model"), provider)

    def _post_json(self, endpoint: str, headers: dict[str, str], payload: dict[str, Any]) -> dict[str, Any]:
        try:
            with httpx.Client(timeout=self.settings.llm_timeout_seconds) as client:
                response = client.post(
                    endpoint,
                    headers=headers,
                    json=payload,
                )
        except httpx.HTTPError as exc:
            raise LLMProviderError(
                "AI_SERVICE_UNAVAILABLE",
                f"Cannot connect to AI provider: {exc}",
            ) from exc

        if response.status_code >= 400:
            raise LLMProviderError(
                "AI_SERVICE_UNAVAILABLE",
                f"AI provider returned HTTP {response.status_code}.",
                status_code=502,
            )

        try:
            return response.json()
        except json.JSONDecodeError:
            stream_data = _parse_chat_completion_stream(response.text)
            if stream_data is not None:
                return stream_data
            raise LLMProviderError(
                "AI_SERVICE_UNAVAILABLE",
                "AI provider returned a non-JSON response.",
                status_code=502,
            )

    def _result_from_text(self, text: str, model: Any, provider: str) -> LLMResult:
        if not text:
            raise LLMProviderError(
                "AI_SERVICE_UNAVAILABLE",
                "AI provider returned an empty response.",
                status_code=502,
            )

        return LLMResult(
            text=text.strip(),
            model=str(model or self.settings.llm_model),
            provider=provider,
        )


def _extract_openai_text(data: dict[str, Any]) -> str:
    output_text = data.get("output_text")
    if isinstance(output_text, str):
        return output_text

    chunks: list[str] = []
    for item in data.get("output", []):
        if not isinstance(item, dict):
            continue
        for content in item.get("content", []):
            if not isinstance(content, dict):
                continue
            text = content.get("text")
            if isinstance(text, str):
                chunks.append(text)

    return "\n".join(chunks).strip()


def _extract_chat_completion_text(data: dict[str, Any]) -> str:
    choices = data.get("choices")
    if not isinstance(choices, list) or not choices:
        return ""

    first = choices[0]
    if not isinstance(first, dict):
        return ""

    message = first.get("message")
    if not isinstance(message, dict):
        return ""

    content = message.get("content")
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        chunks: list[str] = []
        for part in content:
            if isinstance(part, dict) and isinstance(part.get("text"), str):
                chunks.append(part["text"])
        return "\n".join(chunks).strip()

    return ""


def _parse_chat_completion_stream(body: str) -> dict[str, Any] | None:
    chunks: list[str] = []
    model = None

    for raw_line in body.splitlines():
        line = raw_line.strip()
        if not line:
            continue

        payload = line.removeprefix("data:").strip() if line.startswith("data:") else line
        if not payload or payload == "[DONE]":
            continue

        try:
            data = json.loads(payload)
        except json.JSONDecodeError:
            return None

        if model is None:
            model = data.get("model")

        choices = data.get("choices")
        if not isinstance(choices, list):
            continue

        for choice in choices:
            if not isinstance(choice, dict):
                continue
            delta = choice.get("delta")
            if isinstance(delta, dict) and isinstance(delta.get("content"), str):
                chunks.append(delta["content"])
            message = choice.get("message")
            if isinstance(message, dict) and isinstance(message.get("content"), str):
                chunks.append(message["content"])
            content = choice.get("content")
            if isinstance(content, str):
                chunks.append(content)

    if not chunks:
        return None

    return {
        "model": model,
        "choices": [
            {
                "message": {
                    "content": "".join(chunks),
                },
            }
        ],
    }


def _extract_gemini_text(data: dict[str, Any]) -> str:
    chunks: list[str] = []
    for candidate in data.get("candidates", []):
        if not isinstance(candidate, dict):
            continue
        content = candidate.get("content")
        if not isinstance(content, dict):
            continue
        for part in content.get("parts", []):
            if not isinstance(part, dict):
                continue
            text = part.get("text")
            if isinstance(text, str):
                chunks.append(text)

    return "\n".join(chunks).strip()
