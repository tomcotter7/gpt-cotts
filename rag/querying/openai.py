import json
from pathlib import Path

from openai import OpenAI

client = OpenAI()


def get_prompt(prompt_type: str) -> str:
    with open(Path(__file__).parent / "prompts.json", "r") as f:
        prompts = json.load(f)
    return prompts[prompt_type]


def query_openai(prompt: str, query_type: str) -> str:
    system_prompt = get_prompt(query_type)
    context = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
    ]

    stream = client.chat.completions.create(
            messages=context,  # type: ignore
            model="gpt-3.5-turbo",
            stream=True
    )

    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            yield chunk.choices[0].delta.content  # type: ignore
