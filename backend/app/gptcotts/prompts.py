from pydantic import BaseModel


class BasePrompt(BaseModel):
    """Base class for prompts."""
    system: str
    expertise: str

    def system_prompt(self):
        """Return the system prompt."""
        return self.system.format(expertise=self.expertise)

class RAGPrompt(BasePrompt):
    system: str = "You are a AI language model called gpt-cotts. Given a query and a relevant context to that query, you are tasked with generating a response to that query. You should act as if you have {expertise} expertise in the topic asked about."
    context: list[dict]
    query: str

    def __str__(self):
        """Return the RAG prompt as a string."""
        context = "\n\n".join([f"{c['text']}" for c in self.context])
        return f"""<context>{context}</context>\n<query>{self.query}</query>"""

class NoContextPrompt(BasePrompt):
    system: str = "You are a AI language model called gpt-cotts. Given a query, you are tasked with generating a response to that query. You should act as if you have {expertise} expertise in the topic asked about."
    query: str

    def __str__(self):
        """Return the base prompt as a string."""
        return f"""{self.query}"""

class RewriteQueryFunction(BaseModel):
    new_query: str

class RewriteQueryForRAG(BasePrompt):
    system: str = """You are a AI assistant with one task.

Rewrite the input query (<query>) based on the chat history (<history>) such that is it optimized for retrieval and contains the keywords it is referencing. If it does not need to be re-written, return the original query.

Some tips:
    - Words like 'it', 'that', 'this', etc. should be replaced with the actual noun they are referencing.
    - If the query is too vague, make it more specific.

Return the results of the task as a JSON output.
"""
    history: list[dict]
    query: str

    def __str__(self):
        """Return the prompt as a string."""
        return f""""<history>{self.history}</history><query>{self.query}</query>"""

