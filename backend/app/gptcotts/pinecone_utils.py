import os
from functools import lru_cache

from pinecone import Pinecone

from .utils import timing


@timing
@lru_cache
def connect_to_pinecone() -> Pinecone:
    """Connect to the Pinecone API.

    Returns:
        The Pinecone client.
    """
    pc = Pinecone(os.getenv("PINECONE_API_KEY"))
    return pc


@timing
def wipe_namespace(index: str, namespace: str) -> None:
    """Wipe a namespace from a Pinecone index.

    Args:
        index: The name of the Pinecone index.
        namespace: The name of the namespace to be wiped.
    """
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    pc_index.delete(delete_all=True, namespace=namespace)  # type: ignore


@timing
def delete_single_class(index: str, namespace: str, class_name: str) -> None:
    """Delete a class from a Pinecone index.

    Args:
        index: The name of the Pinecone index.
        namespace: The name of the namespace.
        class_name: The name of the class to be deleted.
    """
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    ids = [
        d["id"]
        for d in pc_index.query(
            namespace=namespace,
            vector=[0.0 for _ in range(1024)],
            top_k=500,
            filter={"class": {"$eq": class_name}},
        )["matches"]
    ]

    if ids:
        pc_index.delete(ids=ids, namespace=namespace)  # type: ignore
