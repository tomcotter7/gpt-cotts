from typing import Optional

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from gptcotts.prompts import BasePrompt, NoContextPrompt, RAGPrompt
from gptcotts.retrieval import search
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter(
    prefix="/gptcotts/generation"
)

class NonRAGRequest(BaseModel):
    query: str
    model: Optional[str] = "gpt-3.5-turbo"
    history: list = []

class RAGRequest(BaseModel):
    query: str
    index: str = "notes"
    namespace: str = "tcotts-notes"
    model: Optional[str] = "gpt-3.5-turbo"
    history: list = []

class LLMRequest(BaseModel):
    prompt: BasePrompt
    model: str
    history: list

def filter_history(history):
    history = sorted(history, key=lambda x: x["id"])
    history = [{ k : v for k, v in item.items() if k in ["role", "content"]} for item in history]
    history = history[-3:]
    return history

@router.post("/base")
def generate_response(request: NonRAGRequest):
    try:
        history = filter_history(request.history)
        model = request.model or "gpt-3.5-turbo"
        llm_request = LLMRequest(
                prompt=NoContextPrompt(query=request.query),
                model=model,
                history=history
        )
        return StreamingResponse(generate_openai_response(llm_request))
    except Exception as e:
        return {
            "status": "400",
            "message": str(e)
        }

@router.post("/rag")
def generate_rag_response(request: RAGRequest):
    try:
        history = filter_history(request.history)
        relevant_context = search(
                request.index,
                request.namespace,
                request.query,
                history,
                rerank=True,
                rerank_threshold=0.75
        )
        model = request.model or "gpt-3.5-turbo"
        if not relevant_context:
            llm_request = LLMRequest(prompt=NoContextPrompt(query=request.query), model=model, history=history)
            return StreamingResponse(generate_openai_response(llm_request))

        llm_request = LLMRequest(prompt=RAGPrompt(context=relevant_context, query=request.query), model=model, history=history)
        return StreamingResponse(generate_openai_response(llm_request, relevant_context))
    except Exception as e:
        return {
            "status": "400",
            "message": str(e)
        }

def generate_openai_response(request: LLMRequest, context: list[dict] = []):
    client = OpenAI()
    model = request.model or "gpt-3.5-turbo"
    system_prompt = request.prompt.system
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

    yield "<EOS><SOC>"

    for context_item in context:
        yield context_item["text"]
