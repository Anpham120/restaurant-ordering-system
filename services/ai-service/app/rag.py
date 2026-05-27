from dataclasses import dataclass
from pathlib import Path
import re


FALLBACK_ANSWER = "Hiện tại hệ thống chưa có đủ dữ liệu để kết luận."


@dataclass(frozen=True)
class SearchResult:
    answer: str
    sources: list[str]


class KnowledgeBase:
    def __init__(self, root: Path) -> None:
        self.root = root

    def search(self, query: str, limit: int = 3) -> SearchResult:
        documents = self._documents()
        if not documents:
            return SearchResult(FALLBACK_ANSWER, [])

        query_terms = _terms(query)
        if not query_terms:
            return SearchResult(FALLBACK_ANSWER, [])

        ranked: list[tuple[int, str, str]] = []
        for source, content in documents:
            content_terms = set(_terms(content))
            score = sum(1 for term in query_terms if term in content_terms)
            if score > 0:
                ranked.append((score, source, content))

        if not ranked:
            return SearchResult(FALLBACK_ANSWER, [])

        ranked.sort(key=lambda item: item[0], reverse=True)
        selected = ranked[:limit]
        snippets = [_snippet(content) for _, _, content in selected]
        sources = [source for _, source, _ in selected]
        answer = " ".join(snippets).strip() or FALLBACK_ANSWER
        return SearchResult(answer, sources)

    def rebuild_index(self) -> dict:
        documents = self._documents()
        return {
            "indexedDocuments": len(documents),
            "sources": [source for source, _ in documents],
        }

    def _documents(self) -> list[tuple[str, str]]:
        if not self.root.exists():
            return []

        documents: list[tuple[str, str]] = []
        for path in sorted(self.root.rglob("*.md")):
            content = path.read_text(encoding="utf-8").strip()
            if content:
                documents.append((path.name, content))
        return documents


def _terms(value: str) -> list[str]:
    return re.findall(r"[\wÀ-ỹ]+", value.lower())


def _snippet(content: str, max_length: int = 500) -> str:
    text = re.sub(r"\s+", " ", content).strip()
    if len(text) <= max_length:
        return text
    return text[: max_length - 3].rstrip() + "..."
