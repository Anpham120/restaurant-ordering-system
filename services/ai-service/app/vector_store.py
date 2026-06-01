from dataclasses import dataclass
import json
from pathlib import Path
from typing import Protocol


MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
INDEX_DIR_NAME = ".index"
FAISS_INDEX_FILE = "knowledge.faiss"
METADATA_FILE = "metadata.json"


class EmbeddingModel(Protocol):
    def encode(self, sentences: list[str] | str, normalize_embeddings: bool = True): ...


@dataclass(frozen=True)
class VectorSearchHit:
    source: str
    content: str
    score: float


class VectorStoreUnavailable(RuntimeError):
    pass


class VectorStore:
    def __init__(self, root: Path, model_name: str = MODEL_NAME) -> None:
        self.root = root
        self.index_dir = root / INDEX_DIR_NAME
        self.index_path = self.index_dir / FAISS_INDEX_FILE
        self.metadata_path = self.index_dir / METADATA_FILE
        self.model_name = model_name

    def build_index(self) -> dict:
        documents = self._documents()
        self.index_dir.mkdir(parents=True, exist_ok=True)

        if not documents:
            self._write_metadata([])
            return {
                "indexedDocuments": 0,
                "sources": [],
                "indexPath": str(self.index_path),
                "model": self.model_name,
            }

        faiss = _import_faiss()
        model = _load_model(self.model_name)
        texts = [content for _, content in documents]
        embeddings = model.encode(texts, normalize_embeddings=True)
        index = faiss.IndexFlatIP(len(embeddings[0]))
        index.add(embeddings)
        faiss.write_index(index, str(self.index_path))
        self._write_metadata(documents)

        return {
            "indexedDocuments": len(documents),
            "sources": [source for source, _ in documents],
            "indexPath": str(self.index_path),
            "model": self.model_name,
        }

    def search(self, query: str, top_k: int = 3) -> list[VectorSearchHit]:
        documents = self._documents()
        if not documents or not query.strip():
            return []

        faiss = _import_faiss()
        model = _load_model(self.model_name)
        if not self.index_path.exists() or not self.metadata_path.exists():
            self.build_index()

        index = faiss.read_index(str(self.index_path))
        metadata = self._read_metadata()
        query_embedding = model.encode([query], normalize_embeddings=True)
        scores, indices = index.search(query_embedding, min(top_k, len(metadata)))

        hits: list[VectorSearchHit] = []
        for score, idx in zip(scores[0], indices[0], strict=False):
            if idx < 0 or idx >= len(metadata):
                continue
            item = metadata[idx]
            hits.append(
                VectorSearchHit(
                    source=item["source"],
                    content=item["content"],
                    score=float(score),
                )
            )
        return hits

    def _documents(self) -> list[tuple[str, str]]:
        if not self.root.exists():
            return []

        documents: list[tuple[str, str]] = []
        for path in sorted(self.root.rglob("*.md")):
            if INDEX_DIR_NAME in path.parts:
                continue
            content = path.read_text(encoding="utf-8").strip()
            if content:
                documents.append((path.name, content))
        return documents

    def _write_metadata(self, documents: list[tuple[str, str]]) -> None:
        payload = [{"source": source, "content": content} for source, content in documents]
        self.metadata_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    def _read_metadata(self) -> list[dict[str, str]]:
        return json.loads(self.metadata_path.read_text(encoding="utf-8"))


def _load_model(model_name: str) -> EmbeddingModel:
    try:
        from sentence_transformers import SentenceTransformer
    except ImportError as exc:
        raise VectorStoreUnavailable(
            "sentence-transformers is not installed. Run pip install -r requirements.txt."
        ) from exc

    return SentenceTransformer(model_name)


def _import_faiss():
    try:
        import faiss
    except ImportError as exc:
        raise VectorStoreUnavailable(
            "faiss-cpu is not installed. Run pip install -r requirements.txt."
        ) from exc

    return faiss
