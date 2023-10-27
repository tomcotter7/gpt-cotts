import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """
You are an extension of an AI assistant who uses my notes as additional context.
You should answer questions using both your own knowledge as an AI, as well as my notes.
You will be passed a prompt of the form "Potential Context: <context> ### Question: <question>.
The context may or may not contain the answer to the question.
Your job is to answer concisely, and act as a Software Craftsmanship assistant.
"""

class ModelQueryHandler:
    def __init__(self):
        self.context = [{"role": "system", "content": SYSTEM_PROMPT}]

    def reset_context(self) -> None:
        self.context = [{"role": "system", "content": SYSTEM_PROMPT}]

    def build_user_input(self, prompt: str, chunks: list[str]) -> str:
        space = " "
        context = f"Potential Context: {space.join(chunks)} ### Question: {prompt}"
        return context

    def build_messages(self, user_input: str) -> list[dict]:
        self.context = self.context + [{"role": "user", "content": user_input}]
        return self.context

    def query(self, prompt: str, chunks: list[str]) -> str:
        user_input = self.build_user_input(prompt, chunks)
        msgs = self.build_messages(user_input)
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=msgs,
            temperature=0.5,
            max_tokens=512,
            frequency_penalty=0.2
        )
        model_response = response.choices[0].message.content  # type: ignore
        self.context = self.context + [{"role": "assitant",
                                        "content": model_response}]
        return model_response
