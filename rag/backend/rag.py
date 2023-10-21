from .querying.openai import query
from ..data_processing.database.weaviate import query_weaviate


def rag(input_query: str) -> tuple[str, list[str]]:

    chunks = query_weaviate(input_query, "localhost")
    model_response = query(input_query, chunks)
    return model_response, chunks
