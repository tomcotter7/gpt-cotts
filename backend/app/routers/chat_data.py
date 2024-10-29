import datetime
import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from gptcotts import config as cfg
from gptcotts.auth_utils import User, verify_google_token
from gptcotts.dynamodb_utils import update_table_item
from pydantic import BaseModel

router = APIRouter(prefix="/gptcotts/chat_data")


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
    if chat_data.conversation_id is None:
        chat_data.conversation_id = (
            datetime.datetime.now().strftime("%Y%m%d%H%M%S") + "-" + str(uuid.uuid4())
        )

    structured_chat_data = {
        "email": {"S": current_user.email},
        "conversation_id": {"S": chat_data.conversation_id},
        "chats": {"L": [{"M": format_chat(chat)} for chat in chat_data.chats]},
    }

    update_table_item(cfg.CHAT_TABLE, structured_chat_data)

    return {"status": "success"}
