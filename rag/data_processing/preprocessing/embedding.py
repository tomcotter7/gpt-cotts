import time

import numpy as np
from sentence_transformers import SentenceTransformer

from ...utils import load_config


def embed(doc: str, model: SentenceTransformer) -> np.ndarray:
    embedding = model.encode(doc)
    # get dimensions of embedding
    return embedding  # type: ignore


def embed_docs(docs: list[str]) -> list[np.ndarray]:
    print(f'Total to embed: {len(docs)}')
    model = SentenceTransformer(load_config()['embedding_model'])
    embeddings = []
    start = time.time()
    for i, doc in enumerate(docs):
        if i % 10 == 0:
            print(f'Embedding {i}/{len(docs)}')
        embeddings.append(embed(doc, model))
    end = time.time()
    print(f'Total time to embed: {end - start}')
    return embeddings
