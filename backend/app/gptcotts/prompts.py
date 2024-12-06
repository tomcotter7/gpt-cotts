from pydantic import BaseModel

# --- PROMPTS ---


class BasePrompt(BaseModel):
    """Base class for prompts."""

    system: str
    expertise: str = "normal"
    guidelines: list[str] = [
        "If you missing information, prior to providing a solution, ask the user questions to gather the necessary information.",
        "Before attempting to solve any problems, first detail what you plan to do, using a markdown list. Mark your plan with 'My Plan:\n'",
        "Be brief in your responses, but provide enough detail to be helpful.",
    ]

    def system_prompt(self):
        """Return the system prompt."""
        if len(self.guidelines) > 0:
            guidelines = "\n".join(self.guidelines)
            return f"{self.system.format(expertise=self.expertise)}\n\n<guidelines>{guidelines}</guidelines>"

        return self.system.format(expertise=self.expertise)


class RAGPrompt(BasePrompt):
    system: str = "You are a AI language model called gpt-cotts. Given a query (<query></query>) and a relevant context (<context></context>) to that query, you are tasked with generating a response to that query. Explain the answer as if the user had {expertise} knowledge in the topic."
    context: list[dict]
    query: str

    def __str__(self):
        """Return the RAG prompt as a string."""
        context = "\n\n".join([f"{c['text']}" for c in self.context])
        return f"""<context>{context}</context>\n<query>{self.query}</query>"""


class NoContextPrompt(BasePrompt):
    system: str = "You are an assistant called gpt-cotts, tasked with generating a response to a query (<query></query>). Explain the answer as if the user had {expertise} knowledge in the topic."
    query: str

    def __str__(self):
        """Return the users input as a formatted string."""
        return f"""<query>{self.query}</query>"""


class RubberDuckPrompt(BasePrompt):
    system: str = """You are an assistant called gpt-cotts. However, you should only **guide** me towards an answer when I am discussing a topic with you. Only reveal the answer in terms of code/step by step approach if I explicitly ask you to do so. You should behave as if you are an expert in the topic and the topic is second nature to you.

Think of it like training the best student at the topic in the world. In the hints, do not be too explicit about the steps. Your purpose is to help ME come up with the conditions and to help me develop intuition. Your role should be that of a very composed coach who expects nothing but the best out of their apprentice. Don't be cringe. Don't use emojis. Don't overdo the reminders. Guide through questions, not answers. Let me struggle. If I say 'I don't know', ask me to think about the steps that I should take. If I initially have the right instinct/approach, you should let me know and ask me to build on it."""
    guidelines: list[str] = BasePrompt.model_fields["guidelines"].default + [
        "If required, collect further knowledge from the user by asking questions."
    ]
    query: str

    def __str__(self):
        """Return the users input as a string."""
        return f"""<query>{self.query}</query>"""


class RewriteQueryForRAG(BasePrompt):
    system: str = """You are a AI assistant with one task. Rewrite the input query (<query>) based on the chat history (<history>) such that is it optimized for retrieval and contains the keywords it is referencing. If it does not need to be re-written, return the original query.
"""
    guidelines: list[str] = [
        "Replace words like 'it', 'that', 'this', etc. with the actual noun they are referencing.",
        "Do not add anything else to the query",
        "Do not make assumptions about the context of the query",
        "Use double quotes for the keys and values in the JSON output",
        "Return the results of the task as a JSON output",
    ]
    history: list[dict]
    query: str

    def __str__(self):
        """Return the prompt as a string."""
        return f""""<history>{self.history}</history><query>{self.query}</query>"""


class ChatTitlePrompt(BasePrompt):
    system: str = """You are a AI assistant with one task.

Given a list of chats (<chats></chats>) between a user & a assistant generate a short, snappy title for the conversation. Return the title as a string between <title></title> tags.
"""
    chats: list[dict]

    def __str__(self):
        """Return the prompt as a string."""
        return f"""<chats>{self.chats}</chats>"""


# --- TOOLS ---


class RewriteQueryFunction(BaseModel):
    new_query: str
