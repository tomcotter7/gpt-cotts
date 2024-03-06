import os

from .cohere_utils import connect_to_cohere
from .pinecone_utils import connect_to_pinecone
from .utils import timing


@timing
def batch_embed(data: list[dict]) -> list[dict]:
    """Embed a batch of texts using Cohere.

    `data` is a list of dictionaries, where each dictionary has the following keys
        - text: The text to be embedded.
        - header: The header of the text.
        - class: The class of the text

    Args:
        data: The list of dictionaries to be embedded.

    Returns:
        A list of dictionaries containing the embeddings. Of the form, {"id": str, "metadata": dict, "values": np.ndarray}
    """
    results = []
    cohere_client = connect_to_cohere()

    batch_size = int(os.getenv("COHERE_BATCH_SIZE", 96))
    for i in range(0, len(data), batch_size):
        batch = data[i:i+batch_size]
        texts = [d["text"] for d in batch]
        embeddings = cohere_client.embed(
                texts=texts,
                model=os.getenv("COHERE_MODEL", "embed-english-v3.0"),
                input_type="search_query"
        )
        for idx, emb in enumerate(embeddings.embeddings): # type: ignore
            results.append({
                "id": str(i + idx),
                "metadata": {"header": data[i + idx]["header"], "class": data[i + idx]["class"], "text": data[i + idx]["text"]},
                "values": emb
            })
    return results


@timing
def upsert(index: str, namespace: str, data: list[dict]) -> None:
    """Upsert data into a Pinecone index.

    `data` is a list of dictionaries, where each dictionary has the following keys:
        - text: The text to be embedded and stored.
        - header: The header of the text.
        - class: The class of the text.

    Args:
        index: The name of the Pinecone index.
        namespace: The name of the namespace.
        data: The list of dictionaries to be upserted.
    """
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    data = batch_embed(data)
    pc_index.upsert( # type: ignore
            namespace=namespace,
            vectors=data
    )

@timing
def update_notes(index: str, namespace: str, data: list[dict]) -> None:
    """Update the notes in a Pinecone index.

    Args:
        index: The name of the Pinecone index.
        namespace: The name of the namespace.
        data: The list of dictionaries to be upserted.
    """
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    pc_index.delete( # type: ignore
            namespace=namespace,
            filter={"header": {"$in": [d["header"] for d in data]}}
    )
    upsert(index, namespace, data)

