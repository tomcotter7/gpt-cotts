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
"""

def build_context(prompt: str, chunks: list[str]) -> str:
    space = " "
    context = f"Potential Context: {space.join(chunks)} ### Question: {prompt}"
    return context
    
    

def query(prompt: str, chunks: list[str]) -> str:
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_context(prompt, chunks)}],
        temperature=0.5,
        max_tokens=512,
        frequency_penalty=0.2
    )
    return response.choices[0].message.content
        