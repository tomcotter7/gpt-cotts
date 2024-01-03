"""Main file for the gpt-cotts backend.

Usage:
    uvicorn main:rag --reload
"""
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from .data_processing.markdown import convert_to_sections
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
        orchestrator.query(user_input["message"], False), media_type="text/event-stream"
    )


@rag.post("/rag")
async def get_response_with_context(user_input: dict) -> StreamingResponse:
    """Get response from the model based on the user input. Use their notes as context."""
    return StreamingResponse(
        orchestrator.query(
            user_input["message"], True, {"index": index, "namespace": namespace}
        ),
        media_type="text/event-stream",
    )


@rag.post("/clear")
def clear_context() -> None:
    """Clear the context of the model."""
    orchestrator.clear_context()


@rag.post("/notes")
def get_notes() -> dict:
    """Return the notes of the user."""
    notes_file = Path(__file__).parent / "notes.md"
    with open(notes_file, "r") as f:
        notes = f.read()
        return convert_to_sections(notes)


@rag.post("/notes/save")
def save_notes(new_notes: dict) -> str:
    """Save the notes of the user."""
    notes_file = Path(__file__).parent / "notes.md"
    update_notes(new_notes, notes_file)
    return "success"


def update_notes(new_notes: dict, notes_file: Path) -> None:
    """Update the notes file with the new notes."""
    with open(notes_file, "w") as f:
        for key, value in new_notes.items():
            f.write(f"# {key}\n")
            f.write(f"{value}\n")
