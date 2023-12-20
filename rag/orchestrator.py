"""Orchestrator module."""
from openai import OpenAI

from .database.pinecone import query_pinecone
from .utils import load_config


class Orchestrator:
    """Orchestrator class - deals with the interaction between the user and the model.

    Attributes:
        query_calls (int): Number of times the model has been queried.
        prompts (dict[str, str]): Dictionary containing the prompts for the model.
        gen_model (str): Name of the model to use for generation.
        embedding_model (str): Name of the model to use for embedding.
        context (list[dict[str, str]]): List of dictionaries containing the context of the conversation.
        client (OpenAI): OpenAI client.
    """
    def __init__(self):
        """Initialize the Orchestrator."""
        self.query_calls = 0
        config = load_config()
        self.prompts = config['prompts']
        self.gen_model = config['gen_model']
        self.embedding_model = config['embedding_model']
        self.context = [{"role": "system", "content": self.prompts["regular"]}]
        self.client = OpenAI()

    def clear_context(self) -> None:
        self.query_calls = 0
        self.context = [{"role": "system", "content": self.prompts["regular"]}]

    def reduce_context_size(self) -> None:
        self.query_calls = 3
        self.context = self.context[-6:]

    def setup_rag(self, input_query: str, details: dict) -> str:
        self.context[0] = {"role": "system", "content": self.prompts["rag"]}
        vector_db_result = query_pinecone(input_query, details["index"], self.embedding_model, details["namespace"])
        chunks = []
        for chunk in vector_db_result["matches"]:
            chunks.append(chunk["metadata"]["doc"])
        chunks = "\n".join(chunks)
        print(chunks)
        return f'Potential Context: {chunks} ### Question: {input_query}'

    def query(self, input_query: str, use_rag: bool, details: dict = {}) -> str:
        if self.query_calls > 3:
            self.reduce_context_size()
        if use_rag:
            input_query = self.setup_rag(input_query, details)

        self.context.append({"role": "user", "content": input_query})
        self.query_calls += 1

        stream = self.client.chat.completions.create(
                messages=self.context,
                model=self.gen_model,
                stream=True,
        )

        self.context.append({"role": "assistant", "content": ""})


        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                self.context[-1]["content"] += chunk.choices[0].delta.content
                yield chunk.choices[0].delta.content
