import base64
import json
import logging
import os
from typing import Annotated

import anthropic
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from gptcotts.auth_utils import User, verify_google_token
from gptcotts.prompts import BasePrompt, NoContextPrompt, RAGPrompt, RubberDuckPrompt
from gptcotts.retrieval import search
from openai import OpenAI
from pydantic import BaseModel

router = APIRouter(prefix="/gptcotts/generation")
logging.basicConfig(level=logging.INFO)


class BaseRequest(BaseModel):
    query: str
    model: str
    history: list
    expertise: str = "normal"
    rubber_duck_mode: bool = False


class RAGRequest(BaseRequest):
    rerank_model: str = "cohere"


class LLMRequest(BaseModel):
    prompt: BasePrompt
    model: str
    history: list


def filter_history(history):
    history = sorted(history, key=lambda x: x["id"])
    history = [
        {k: v for k, v in item.items() if k in ["role", "content"]} for item in history
    ]
    history = history[-6:]
    return history


@router.post("/base")
def generate_response(
    current_user: Annotated[User, Depends(verify_google_token)], request: BaseRequest
):
    try:
        logging.info(f">> Received query: {request.query} from {current_user.email}")
        history = filter_history(request.history)
        model = request.model or "claude-3-haiku-20240307"
        prompt = (
            NoContextPrompt(query=request.query, expertise=request.expertise)
            if not request.rubber_duck_mode
            else RubberDuckPrompt(query=request.query, expertise=request.expertise)
        )
        llm_request = LLMRequest(
            prompt=prompt,
            model=model,
            history=history,
        )
        if "claude" in model:
            return StreamingResponse(generate_claude_response(llm_request))
        else:
            return StreamingResponse(generate_openai_response(llm_request))
    except Exception as e:
        return {"status": "400", "message": str(e)}


@router.post("/rag")
def generate_rag_response(
    current_user: Annotated[User, Depends(verify_google_token)], request: RAGRequest
):
    try:
        logging.info(f">> Received query: {request.query} from {current_user.email}")
        history = filter_history(request.history)
        relevant_context = search(
            current_user.email,
            request.query,
            history,
            rerank=True,
            rerank_model=request.rerank_model,
            rerank_threshold=0.75,
        )
        model = request.model or "claude-3-haiku-20240307"
        if not relevant_context:
            llm_request = LLMRequest(
                prompt=NoContextPrompt(
                    query=request.query, expertise=request.expertise
                ),
                model=model,
                history=history,
            )
        else:
            llm_request = LLMRequest(
                prompt=RAGPrompt(
                    context=relevant_context,
                    query=request.query,
                    expertise=request.expertise,
                ),
                model=model,
                history=history,
            )

        encoded_context = base64.b64encode(
            json.dumps(relevant_context).encode()
        ).decode()
        if "claude" in model:
            response = StreamingResponse(
                generate_claude_response(llm_request, relevant_context),
                headers={"X-Relevant-Context": encoded_context},
            )
        else:
            response = StreamingResponse(
                generate_openai_response(llm_request, relevant_context),
                headers={"X-Relevant-Context": encoded_context},
            )
        print(response.headers)
        return response
    except Exception as e:
        return {"status": "400", "message": str(e)}


def generate_claude_response(request: LLMRequest, context: list[dict] = []):
    try:
        messages = request.history + [{"role": "user", "content": str(request.prompt)}]
        client = anthropic.Anthropic()
        with client.messages.stream(
            system=request.prompt.system_prompt(),
            max_tokens=1024,
            messages=messages,  # type: ignore
            model=request.model,
        ) as stream:
            for chunk in stream.text_stream:
                yield chunk

        # if context:
        # yield json.dumps({"context": context})
    except Exception as e:
        logging.error(f"Anthropic error: {e}")
        yield f"An error occurred while generating the response. See {e}"


def generate_openai_response(request: LLMRequest, context: list[dict] = []):
    try:
        if "deepseek" in request.model:
            client = OpenAI(
                api_key=os.getenv("DEEPSEEK_API_KEY"),
                base_url="https://api.deepseek.com",
            )
        else:
            client = OpenAI()
        model = request.model or "gpt-3.5-turbo"
        logging.info(f">>> Using model: {model}")
        system_prompt = request.prompt.system_prompt()
        messages = (
            [{"role": "system", "content": system_prompt}]
            + request.history
            + [{"role": "user", "content": str(request.prompt)}]
        )
        response = client.chat.completions.create(
            model=model,
            messages=messages,  # type: ignore
            temperature=0.4,
            stream=True,
        )
        for chunk in response:
            value = chunk.choices[0].delta.content
            if value:
                yield value

        # if context:
        # yield json.dumps({"context": context})
    except Exception as e:
        logging.error(f"OpenAI/Deepseek error: {e}")
        yield f"An error occurred while generating the response. See {e}"
