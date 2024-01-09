# noqa: D100
import time

import numpy as np
from sentence_transformers import SentenceTransformer

from app.utils import load_config


def embed(doc: str, model: SentenceTransformer) -> np.ndarray:
    """Embed a single document (string).

    Args:
        doc: Document to embed.
        model: SentenceTransformer model to use for embedding.

    Returns:
        The embedding of the document as a numpy array.
    """
    embedding = model.encode(doc)
    # get dimensions of embedding
    return embedding  # type: ignore


def embed_docs(docs: list[str]) -> list[np.ndarray]:
    """Embed a list of documents (strings).

    Args:
        docs: List of documents to embed.

    Returns:
        List of embeddings of the documents as numpy arrays.
    """
    print(f"Total to embed: {len(docs)}")
    model = SentenceTransformer(load_config()["embedding_model"])
    embeddings = []
    start = time.time()
    for i, doc in enumerate(docs):
        if i % 10 == 0:
            print(f"Embedding {i}/{len(docs)}")
        embeddings.append(embed(doc, model))
    end = time.time()
    print(f"Total time to embed: {end - start}")
    return embeddings
