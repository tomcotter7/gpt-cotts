import os

import numpy as np
import pinecone
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

from ...utils import load_config
from ..preprocessing.embedding import embed

load_dotenv()

pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment="gcp-starter")

def upload_to_pinecone(
        embeddings: list[np.ndarray],
        pincone_index: str,
        namespace: str = "tcotts-notes"
) -> None:
    """Upload embeddings to Pinecone."""
    index = pinecone.Index(pincone_index)
    index.delete(delete_all=True, namespace=namespace)
    vectors = []
    i = 0
    for doc, embedding in embeddings:
        vectors.append({
            "id": str(i),
            "metadata": {"doc": doc},
            "values": embedding.tolist()
        })
        i += 1
    index.upsert(vectors=vectors, namespace=namespace)


def query_pinecone(
        query: str,
        pincone_index: str,
        embedding_model: str,
        namespace: str = "tcotts-notes"
) -> dict[str, list]:
    """Query Pinecone with a single query string."""
    model = SentenceTransformer(embedding_model)
    embedding = embed(query, model)
    index = pinecone.Index(pincone_index)
    results = index.query(
            namespace=namespace,
            vector=embedding.tolist(),
            top_k=5,
            include_metadata=True
    )
    return results
