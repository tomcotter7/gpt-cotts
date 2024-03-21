import json
import logging
import os
from pathlib import Path

import cohere
from flashrank import Ranker, RerankRequest
from openai import OpenAI
from pinecone import Index

from .cohere_utils import connect_to_cohere
from .pinecone_utils import connect_to_pinecone
from .prompts import RewriteQueryForRAG, RewriteQueryFunction
from .utils import timing


@timing
def rewrite_query(query: str, history: list[dict]) -> str:
    """Rewrite the query using a language model.

    Args:
        query: The query to be rewritten.

    Returns:
        The rewritten query.
    """

    prompt = RewriteQueryForRAG(query=query, history=history[:-1], expertise="")
    client = OpenAI()
    resp = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": prompt.system},
                  {"role": "user", "content": str(prompt)}],
        temperature=0.0,
        tools=[{
            "type": "function",
            "function": {
                "name": "RewrittenQuery",
                "description": "The new query.",
                "parameters": RewriteQueryFunction.model_json_schema(),
            },
        }],
        tool_choice={
            "type": "function",
            "function": {"name": "RewrittenQuery"},
        },
    )
    response = resp.choices[0].message.tool_calls[0].function.arguments  # type: ignore
    logging.info(f">>> Rewritten query: {response}")
    results = RewriteQueryFunction(**(json.loads(response)))
    return results.new_query

@timing
def load_reranker() -> Ranker:
    """Load the FlashRank reranker.

    Returns:
        The FlashRank reranker.
    """
    path = Path(__file__).parent.parent.parent / "cache"
    if os.path.exists(path):
        logging.info(">>> Loading FlashRank reranker")
    else:
        logging.info(">>> FlashRank reranker not found - downloading it.")

    return Ranker(cache_dir=path) # type: ignore




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
    ranker =  load_reranker()
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
def query_pinecone(pc_index: Index, embedding: list[float], namespace: str, top_k: int = 30) -> list[dict]:
    """Query a Pinecone index.

    Args:
        pc_index: The Pinecone index.
        embedding: The embedding to be used for searching.
        namespace: The name of the namespace.
        top_k: The number of results to return.

    Returns:
        A list of dictionaries containing the search results.
    """
    results = pc_index.query(
            namespace=namespace,
            vector=embedding,
            top_k=top_k,
            include_metadata=True
    )['matches']

    formatted = [{
        "id": result['id'],
        "text": result['metadata']['text'],
        "meta": {k: v for k, v in result['metadata'].items() if k != 'text'}}
    for result in results]

    return formatted

@timing
def embed(cohere_client: cohere.Client, texts: list[str]) -> list[float]:
    """Embed a list of texts using Cohere.

    Args:
        cohere_client: The Cohere client.
        texts: The list of texts to be embedded.

    Returns:
        A list of dictionaries containing the embeddings.
    """
    result = cohere_client.embed(
            texts=texts,
            model=os.getenv("COHERE_MODEL", "embed-english-v3.0"),
            input_type="search_query"
    )
    return result.embeddings[0] # type: ignore

@timing
def search(
        index: str,
        namespace: str,
        query: str,
        chat_history: list[dict],
        top_k: int = 5,
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

        if not pc_index:
            raise ValueError(f"Index {index} not found")

        query = rewrite_query(query, chat_history)

        embedding = embed(cohere_client, [query])
        pinecone_topk = top_k
        if rerank:
            pinecone_topk = top_k * 10
        results = query_pinecone(pc_index, embedding, namespace, top_k=pinecone_topk)

        if rerank:
            results = flashrank_rerank(query, results, threshold=rerank_threshold)

        results = results[:pinecone_topk]
        return results
