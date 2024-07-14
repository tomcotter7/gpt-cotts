import json
import os
import logging
from typing import Annotated

import anthropic
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from gptcotts.auth_utils import User, get_current_user
from gptcotts.prompts import BasePrompt, NoContextPrompt, RAGPrompt
from gptcotts.retrieval import search
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter(
    prefix="/gptcotts/generation"
)

class BaseRequest(BaseModel):
    query: str
    model: str
    history: list
    expertise: str = "normal"

class RAGRequest(BaseRequest):
    index: str = "notes"
    rerank_model: str = "cohere"
    namespace: str = "tcotts-notes"

class LLMRequest(BaseModel):
    prompt: BasePrompt
    model: str
    history: list

def filter_history(history):
    history = sorted(history, key=lambda x: x["id"])
    history = [{ k : v for k, v in item.items() if k in ["role", "content"]} for item in history]
    history = history[-4:]
    return history

@router.post("/base")
def generate_response(
        current_user: Annotated[User, Depends(get_current_user)],
        request: BaseRequest
):
    try:
        history = filter_history(request.history)
        model = request.model or "claude-3-haiku-20240307"
        llm_request = LLMRequest(
                prompt=NoContextPrompt(query=request.query, expertise=request.expertise),
                model=model,
                history=history
        )
        if "claude" in model:
            return StreamingResponse(generate_claude_response(llm_request))
        else:
            return StreamingResponse(generate_openai_response(llm_request))
    except Exception as e:
        return {
            "status": "400",
            "message": str(e)
        }

@router.post("/rag")
def generate_rag_response(
        current_user: Annotated[User, Depends(get_current_user)],
        request: RAGRequest
):
    try:
        history = filter_history(request.history)
        relevant_context = search(
                request.index,
                request.namespace,
                request.query,
                history,
                rerank=True,
                rerank_model=request.rerank_model,
                rerank_threshold=0.75
        )
        model = request.model or "claude-3-haiku-20240307"
        if not relevant_context:
            llm_request = LLMRequest(
                    prompt=NoContextPrompt(query=request.query, expertise=request.expertise),
                    model=model,
                    history=history
            )
        else:
            llm_request = LLMRequest(
                    prompt=RAGPrompt(context=relevant_context, query=request.query, expertise=request.expertise),
                    model=model,
                    history=history
            )

        if "claude" in model:
            return StreamingResponse(generate_claude_response(llm_request, relevant_context))
        else:
            return StreamingResponse(generate_openai_response(llm_request, relevant_context))
    except Exception as e:
        return {
            "status": "400",
            "message": str(e)
        }


def generate_claude_response(request: LLMRequest, context: list[dict] = []):
    messages = request.history + [{"role": "user", "content": str(request.prompt)}]
    client = anthropic.Anthropic()
    with client.messages.stream(
            system=request.prompt.system_prompt(),
            max_tokens=1024,
            messages=messages, # type: ignore
            model=request.model
    ) as stream:
        for chunk in stream.text_stream:
            yield chunk

    if context:
        yield json.dumps({"context": context})



def generate_openai_response(request: LLMRequest, context: list[dict] = []):
    if "deepseek" in request.model:
        client = OpenAI(api_key=os.getenv("DEEPSEEK_API_KEY"), base_url="https://api.deepseek.com")
    else:
        client = OpenAI()
    model = request.model or "gpt-3.5-turbo"
    logging.info(f">>> Using model: {model}")
    system_prompt = request.prompt.system_prompt()
    messages = [{"role": "system", "content": system_prompt}] + request.history \
        + [{"role": "user", "content": str(request.prompt)}]
    response = client.chat.completions.create(
            model = model,
            messages = messages, # type: ignore
            temperature = 0.4,
            stream = True
    )
    for chunk in response:
        value = chunk.choices[0].delta.content
        if value:
            yield value

    if context:
        yield json.dumps({"context": context})
