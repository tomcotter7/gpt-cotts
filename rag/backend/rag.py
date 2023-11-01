from .querying.openai import ModelQueryHandler
from ..data_processing import query_weaviate


class RAG:

    def __init__(self):
        self.mqh = ModelQueryHandler()
        self.query_calls = 0

    def reset_context(self) -> None:
        self.mqh.reset_context()

    def query(self, input_query: str) -> tuple[str, list[str]]:
        chunks = []
        if self.query_calls == 0:
            chunks = query_weaviate(input_query, "localhost")
        model_response = self.mqh.query(input_query, chunks)
        self.query_calls += 1
        if self.query_calls > 2:
            self.reset_context()
            self.query_calls = 0

        return model_response, chunks
