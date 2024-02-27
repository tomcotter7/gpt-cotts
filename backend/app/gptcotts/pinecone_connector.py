# noqa: D100
import logging
import os
from pathlib import Path

import cohere
from dotenv import load_dotenv
from flashrank import Ranker, RerankRequest
from pinecone import Pinecone
from gptcotts.utils import timing

load_dotenv()

@timing
def connect_to_pinecone() -> Pinecone:
    pc = Pinecone(os.getenv("PINECONE_API_KEY"))
    return pc

@timing
def connect_to_cohere() -> cohere.Client:
    cohere_api_key = os.getenv("COHERE_API_KEY")
    if cohere_api_key is None:
        raise ValueError("COHERE_API_KEY is not set in the environment")
    cohere_client = cohere.Client(cohere_api_key)
    return cohere_client

@timing
def flashrank_rerank(query: str, results: list[dict], threshold: float = 0.75) -> list[dict]:
    """Rerank the results using FlashRank.

    `results` must be a list of dictionaries, where each dictionary has the following keys:
        - id: The ID of the result.
        - text: The text of the result.
        - meta: The metadata of the result.

    Args:
        query: The query to be used for reranking.
        results: The list of dictionaries to be reranked.
        threshold: The threshold to filter the results.

    Returns:
        A list of dictionaries containing the reranked results. All chunks with a score lower than the threshold are removed.
    """
    ranker = Ranker(cache_dir=Path(__file__).parent.parent / "cache") # type: ignore
    rerank_request = RerankRequest(
        query=query,
        passages=results
    )
    results = ranker.rerank(rerank_request)
    old_len = len(results)
    results = [{k: v for k, v in result.items() if k != 'score'} for result in results if result["score"] > threshold]
    logging.info(f">>> Reranked from {old_len} to {len(results)}")
    return results

@timing
def search(
        index: str,
        namespace: str,
        query: str,
        rerank: bool = False,
        rerank_threshold: float = 0.75
) -> list[dict]:
        """Search for similar texts in a Pinecone index.

        Args:
            index: The name of the Pinecone index.
            namespace: The name of the namespace.
            query: The query to be used for searching.
            rerank: Whether to rerank the results using FlashRank.
            rerank_threshold: The threshold to filter the results after reranking.

        Returns:
            A list of dictionaries containing the search results.
        """
        pc = connect_to_pinecone()
        cohere_client = connect_to_cohere()
        pc_index = pc.Index(index)
        vector = cohere_client.embed(
                texts=[query],
                model=os.getenv("COHERE_MODEL", "embed-english-v3.0"),
                input_type="search_query"
        )
        embedding = vector.embeddings[0] # type: ignore
        results = pc_index.query( # type: ignore
                namespace=namespace,
                vector=embedding,
                top_k=int(os.getenv("PINECONE_TOP_K", 30)),
                include_metadata=True
        )['matches']

        formatted = [{
            "id": result['id'],
            "text": result['metadata']['text'],
            "meta": {k: v for k, v in result['metadata'].items() if k != 'text'}}
        for result in results]

        if rerank:
            result = flashrank_rerank(query, formatted, threshold=rerank_threshold)
            return result


        return formatted

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

@timing
def wipe_namespace(index: str, namespace: str):
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    pc_index.delete(delete_all=True, namespace=namespace) # type: ignore
