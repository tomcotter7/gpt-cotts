"""Main file for the gpt-cotts backend.

Usage:
    uvicorn main:rag --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .orchestrator import Orchestrator

rag = FastAPI()

origins = ["*"]

rag.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
)


# hardcoding index / namespace for now, will be done by authentification later

index = "main-notes"
namespace = "tcotts-notes"

orchestrator = Orchestrator()

@rag.post("/llm")
async def get_response(user_input: dict) -> StreamingResponse:
    """Get response from the model based on the user input."""
    return StreamingResponse(
            orchestrator.query(user_input['message'], False),
            media_type="text/event-stream"
    )

@rag.post("/rag")
async def get_response_with_context(user_input: dict) -> StreamingResponse:
    """Get response from the model based on the user input. Use their notes as context."""
    return StreamingResponse(
            orchestrator.query(user_input['message'], True, {"index": index, "namespace": namespace}),
            media_type="text/event-stream"
    )

@rag.post("/clear")
def clear_context() -> None:
    """Clear the context of the model."""
    orchestrator.clear_context()

