import base64
import json
import logging
import os
from typing import Annotated

import anthropic
from fastapi import APIRouter, BackgroundTasks, Depends
from fastapi.responses import StreamingResponse
from gptcotts import config as cfg
from gptcotts.auth_utils import User, verify_google_token
from gptcotts.credit_utils import validate_credits
from gptcotts.dynamodb_utils import get_table_item, update_table_item
from gptcotts.exceptions import NotEnoughCreditsError
from gptcotts.prompts import BasePrompt, NoContextPrompt, RAGPrompt, RubberDuckPrompt
from gptcotts.retrieval import search
from openai import OpenAI
from openai.types.chat import ChatCompletionChunk
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


def update_token_count(user: User, model: str, input_tokens: int, output_tokens: int):
    price = (
        input_tokens
        * cfg.API_PRICING.get(model, cfg.API_PRICING["default"])[
            "input_price_per_one_token"
        ]
        + output_tokens
        * cfg.API_PRICING.get(model, cfg.API_PRICING["default"])[
            "output_price_per_one_token"
        ]
    )

    logging.info(
        f"Usage from {user.email} on model {model}: {input_tokens} input tokens, {output_tokens} output tokens, ${price:.10f} total price"
    )

    old_values = get_table_item(cfg.USER_TABLE, {"email": user.email})

    if not old_values.get("Item"):
        available_credits = 10
        admin = False
    else:
        available_credits = max(
            float(old_values["Item"].get("available_credits", {"N": 0})["N"]) - price, 0
        )
        input_tokens = int(old_values["Item"]["input_tokens"]["N"]) + input_tokens
        output_tokens = int(old_values["Item"]["output_tokens"]["N"]) + output_tokens
        admin = (
            str(old_values["Item"].get("admin", {"S": "false"})["S"]).lower() == "true"
        )

    update_table_item(
        cfg.USER_TABLE,
        {
            "email": {"S": user.email},
            "admin": {"S": str(admin).lower()},
            "available_credits": {"N": str(available_credits)},
            "input_tokens": {"N": str(input_tokens)},
            "output_tokens": {"N": str(output_tokens)},
        },
    )


def process_anthropic_accum(accum: anthropic.types.Message, user: User):
    update_token_count(
        user, accum.model, accum.usage.input_tokens, accum.usage.output_tokens
    )


def process_openai_accum(accum: ChatCompletionChunk, user: User):
    if accum.usage is None:
        logging.error("Unable to extract usage from OpenAI completion")
        return
    update_token_count(
        user, accum.model, accum.usage.prompt_tokens, accum.usage.completion_tokens
    )


@router.post("/base")
def generate_response(
    current_user: Annotated[User, Depends(verify_google_token)],
    request: BaseRequest,
    background_tasks: BackgroundTasks,
):
    try:
        logging.info(f">> Received query: {request.query} from {current_user.email}")
        valid = validate_credits(current_user.email)
        if not valid:
            raise NotEnoughCreditsError()
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
            return StreamingResponse(
                generate_claude_response(
                    llm_request, user=current_user, background_tasks=background_tasks
                )
            )
        else:
            return StreamingResponse(
                generate_openai_response(
                    llm_request, user=current_user, background_tasks=background_tasks
                )
            )
    except Exception as e:
        return {"status": "400", "message": str(e)}


@router.post("/rag")
def generate_rag_response(
    current_user: Annotated[User, Depends(verify_google_token)],
    request: RAGRequest,
    background_tasks: BackgroundTasks,
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
                generate_claude_response(
                    llm_request,
                    user=current_user,
                    background_tasks=background_tasks,
                ),
                headers={"X-Relevant-Context": encoded_context},
            )
        else:
            response = StreamingResponse(
                generate_openai_response(
                    llm_request, user=current_user, background_tasks=background_tasks
                ),
                headers={"X-Relevant-Context": encoded_context},
            )
        return response
    except Exception as e:
        return {"status": "400", "message": str(e)}


def generate_claude_response(
    request: LLMRequest, user: User, background_tasks: BackgroundTasks
):
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

        accum = stream.get_final_message()
        background_tasks.add_task(process_anthropic_accum, accum, user)

    except Exception as e:
        logging.error(f"Anthropic error: {e}")
        yield f"An error occurred while generating the response. See {e}"


def generate_openai_response(
    request: LLMRequest, user: User, background_tasks: BackgroundTasks
):
    try:
        if "deepseek" in request.model:
            client = OpenAI(
                api_key=os.getenv("DEEPSEEK_API_KEY"),
                base_url="https://api.deepseek.com",
            )
        else:
            client = OpenAI()
        model = request.model or "gpt-4o-mini-2024-07-18"
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
            stream_options={"include_usage": True},
        )
        chunk = None
        for chunk in response:
            choice = chunk.choices[0]
            if choice.finish_reason is not None:
                break

            value = choice.delta.content
            if value:
                yield value

        if "deepseek" in request.model and chunk is not None:
            accum = chunk
        else:
            accum = next(response)
        background_tasks.add_task(process_openai_accum, accum, user)

    except Exception as e:
        logging.error(f"OpenAI/Deepseek error: {str(e)}")
        yield f"An error occurred while generating the response. See {e}"
