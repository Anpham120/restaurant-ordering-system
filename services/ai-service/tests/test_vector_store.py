import json

from app.vector_store import VectorSearchHit, VectorStore


class FakeIndex:
    def __init__(self, dimension: int) -> None:
        self.dimension = dimension
        self.vectors = []

    def add(self, vectors) -> None:
        self.vectors = vectors

    def search(self, query_embedding, top_k: int):
        return [[0.95]], [[0]]


class FakeFaiss:
    last_index: FakeIndex | None = None

    def IndexFlatIP(self, dimension: int) -> FakeIndex:
        self.last_index = FakeIndex(dimension)
        return self.last_index

    def write_index(self, index: FakeIndex, path: str) -> None:
        with open(path, "w", encoding="utf-8") as file:
            file.write("fake-faiss-index")

    def read_index(self, path: str) -> FakeIndex:
        assert path.endswith("knowledge.faiss")
        return self.last_index or FakeIndex(2)


class FakeModel:
    def encode(self, sentences, normalize_embeddings: bool = True):
        assert normalize_embeddings is True
        return [[0.1, 0.9] for _ in sentences]


def test_vector_store_builds_index_and_searches(tmp_path, monkeypatch) -> None:
    kb = tmp_path / "knowledge_base"
    kb.mkdir()
    (kb / "menu.md").write_text(
        "Salad rau củ phù hợp người cần tránh gluten.",
        encoding="utf-8",
    )
    fake_faiss = FakeFaiss()
    monkeypatch.setattr("app.vector_store._import_faiss", lambda: fake_faiss)
    monkeypatch.setattr("app.vector_store._load_model", lambda _: FakeModel())

    store = VectorStore(kb)
    metadata = store.build_index()
    hits = store.search("món nào không gây dị ứng gluten?")

    assert metadata["indexedDocuments"] == 1
    assert (kb / ".index" / "knowledge.faiss").exists()
    assert json.loads((kb / ".index" / "metadata.json").read_text(encoding="utf-8"))[0]["source"] == "menu.md"
    assert isinstance(hits[0], VectorSearchHit)
    assert hits[0].source == "menu.md"
    assert "tránh gluten" in hits[0].content
