import openai
import os
from dotenv import load_dotenv
from pathlib import Path
import json

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")


class ModelQueryHandler:
    def __init__(self, type: str = "rag"):
        with open(Path(__file__).parent / "prompts.json", "r") as f:
            self.prompts = json.load(f)

        self.system_prompt = self.prompts[type]
        self.context = [{"role": "system", "content": self.system_prompt}]

    def reset_context(self) -> None:
        self.context = [{"role": "system", "content": self.system_prompt}]

    def reduce_context_size(self) -> None:
        if len([msg for msg in self.context if msg["role"] == "user"]) > 3:
            self.context = [self.context[0]] + self.context[-6:]

    def build_user_input(self, prompt: str, chunks: list[str]) -> str:
        space = " "
        context = (
            f"Potential Context: {space.join(chunks)} ### Question: {prompt}"
        )
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
        self.context = self.context + [{"role": "assistant",
                                        "content": model_response}]
        return model_response
