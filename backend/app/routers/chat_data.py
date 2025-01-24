import datetime
import logging
import re
import uuid
from typing import Annotated

import anthropic
from cachetools import TTLCache, cached
from fastapi import APIRouter, Depends
from gptcotts import config as cfg
from gptcotts import prompts
from gptcotts.auth_utils import User, verify_google_token
from gptcotts.dynamodb_utils import (
    delete_table_item,
    get_all_items_with_partition_key,
    get_table_item,
    put_table_item,
    update_table_item,
)
from gptcotts.utils import timing
from pydantic import BaseModel

router = APIRouter(prefix="/gptcotts/chat_data")
cache = TTLCache(maxsize=10, ttl=30)


class GetChatRequest(BaseModel):
    conversation_id: str


class Context(BaseModel):
    id: str
    text: str
    meta: dict[str, str]


class Chat(BaseModel):
    id: int
    role: str
    content: str
    context: list[Context]


class ChatData(BaseModel):
    chats: list[Chat]
    conversation_id: str | None = None
    title: str | None = None


@timing
def get_chat_title(chats: list[Chat]) -> str | None:
    try:
        chats_dict = [
            {"role": chat.role, "content": chat.content, "context": chat.context}
            for chat in chats
        ]
        prompt = prompts.ChatTitlePrompt(chats=chats_dict)

        client = anthropic.Anthropic()
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            system=prompt.system,
            messages=[{"role": "user", "content": str(prompt)}],
            max_tokens=64,
        )

        text = response.content[0].text  # type: ignore
        logging.info(f"Received title: {text}")
        pattern = r"<title>(.*?)</title>"
        title = re.match(pattern, text, re.DOTALL)
        if title:
            logging.info(f"Title: {title.group(1)}")
            return title.group(1)
        else:
            logging.error("Failed to generate title, no title found in response.")
            return None

    except Exception as e:
        logging.error(f"Failed to generate title: {e}")
        return None


def format_chat(chat: Chat) -> dict:
    def format_context(context: Context) -> dict:
        return {
            "id": {"S": context.id},
            "text": {"S": context.text},
            "meta": {"M": {k: {"S": v} for k, v in context.meta.items()}},
        }

    return {
        "id": {"N": str(chat.id)},
        "role": {"S": chat.role},
        "content": {"S": chat.content},
        "context": {"L": [{"M": format_context(context)} for context in chat.context]},
    }


@router.post("/save")
def save_chat_data(
    current_user: Annotated[User, Depends(verify_google_token)], chat_data: ChatData
):
    if len(chat_data.chats) == 0:
        return {"status": "error", "message": "No chats to save."}
    title = chat_data.title if chat_data.title else get_chat_title(chat_data.chats)
    chats = [{"M": format_chat(chat)} for chat in chat_data.chats]
    if chat_data.conversation_id is None:
        conversation_id = (
            datetime.datetime.now().strftime("%Y%m%d%H%M%S") + "-" + str(uuid.uuid4())
        )
        title = f"Conversation: {conversation_id}" if title is None else title
        item = {
            "conversation_id": {"S": chat_data.conversation_id},
            "title": {"S": title},
            "chats": {"L": chats},
        }
        put_table_item(cfg.CHAT_TABLE, item)
    else:
        update_table_item(
            cfg.CHAT_TABLE,
            {"conversation_id": chat_data.conversation_id},
            "SET chats = :chats",
            {":chats": {"L": chats}},
        )

    return {
        "status": "success",
        "conversation_id": chat_data.conversation_id,
        "title": title,
    }


@cached(cache=cache)
def load_all_convs(email: str) -> list[dict]:
    data = get_all_items_with_partition_key(
        cfg.CHAT_TABLE, {"email": email}, "title, conversation_id"
    ).get("Items", [])
    return data


@router.get("/all")
def get_all_conversations(current_user: Annotated[User, Depends(verify_google_token)]):
    convs = load_all_convs(current_user.email)
    formatted_convs = [
        {"title": chat["title"]["S"], "conversation_id": chat["conversation_id"]["S"]}
        for chat in convs
    ]

    return {"status": "success", "conversations": formatted_convs}


@router.post("/single_chat")
def get_single_chat(
    current_user: Annotated[User, Depends(verify_google_token)],
    chat_request: GetChatRequest,
):
    data = get_table_item(
        cfg.CHAT_TABLE,
        {"email": current_user.email, "conversation_id": chat_request.conversation_id},
    ).get("Item", {})
    if not data:
        return {"status": "error", "message": "Conversation not found."}

    chats = data["chats"]["L"]
    formatted_chats = [
        {
            "role": chat["M"]["role"]["S"],
            "content": chat["M"]["content"]["S"],
            "context": chat["M"]["context"]["L"],
        }
        for chat in chats
    ]

    return {"status": "success", "chats": formatted_chats}


@router.post("/delete")
def delete(
    current_user: Annotated[User, Depends(verify_google_token)],
    chat_request: GetChatRequest,
):
    delete_table_item(
        cfg.CHAT_TABLE,
        {"email": current_user.email, "conversation_id": chat_request.conversation_id},
    )
    return {"status": "success", "message": "Conversation deleted."}
