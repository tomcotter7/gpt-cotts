from pydantic import BaseModel


class BasePrompt(BaseModel):
    """Base class for prompts."""
    system: str

class RAGPrompt(BasePrompt):
    system: str = "You are a AI language model called gpt-cotts. Given a query and a relevant context to that query, you are tasked with generating a response to that query"
    context: list[dict]
    query: str

    def __str__(self):
        """Return the RAG prompt as a string."""
        context = "\n\n".join([f"{c['text']}" for c in self.context])
        return f"""<context>{context}</context>\n<query>{self.query}</query>"""

class NoContextPrompt(BasePrompt):
    system: str = "You are a AI language model called gpt-cotts. Given a query, you are tasked with generating a response to that query"
    query: str

    def __str__(self):
        """Return the base prompt as a string."""
        return f"""{self.query}"""
