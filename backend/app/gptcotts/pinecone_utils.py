import os

from pinecone import Pinecone

from .utils import timing


@timing
def connect_to_pinecone() -> Pinecone:
    pc = Pinecone(os.getenv("PINECONE_API_KEY"))
    return pc

@timing
def wipe_namespace(index: str, namespace: str):
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    pc_index.delete(delete_all=True, namespace=namespace) # type: ignore
