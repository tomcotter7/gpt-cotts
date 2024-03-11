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
    history: Optional[list] = []

class RAGRequest(BaseModel):
    query: str
    index: str = "notes"
    namespace: str = "tcotts-notes"
    model: Optional[str] = "gpt-3.5-turbo"
    history: Optional[list] = []

class LLMRequest(BaseModel):
    prompt: BasePrompt
    model: Optional[str] = "gpt-3.5-turbo"
    history: Optional[list] = []

@router.post("/base")
def generate_response(request: NonRAGRequest):
    try:
        llm_request = LLMRequest(prompt=NoContextPrompt(query=request.query), model=request.model, history=request.history)
        return StreamingResponse(generate_openai_response(llm_request))
    except Exception as e:
        return {
            "status": "400",
            "message": str(e)
        }

@router.post("/rag")
def generate_rag_response(request: RAGRequest):
    try:
        relevant_context = search(request.index, request.namespace, request.query, rerank=True, rerank_threshold=0.75)
        if not relevant_context:
            llm_request = LLMRequest(prompt=NoContextPrompt(query=request.query), model=request.model, history=request.history)
            return StreamingResponse(generate_openai_response(llm_request))

        llm_request = LLMRequest(prompt=RAGPrompt(context=relevant_context, query=request.query), model=request.model, history=request.history)
        return StreamingResponse(generate_openai_response(llm_request))
    except Exception as e:
        return {
            "status": "400",
            "message": str(e)
        }

def generate_openai_response(request: LLMRequest):
    client = OpenAI()
    model = request.model or "gpt-3.5-turbo"
    system_prompt = request.prompt.system
    response = client.chat.completions.create(
            model = model,
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": str(request.prompt)}
            ],
            temperature = 0.4,
            stream = True
    )
    for chunk in response:
        value = chunk.choices[0].delta.content
        if value:
            yield value
