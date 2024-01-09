"""Main file for the gpt-cotts backend.

Usage:
    uvicorn main:app --reload
"""
import httpx
import os
import urllib
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi_sso.sso.google import GoogleSSO
from pydantic import BaseModel
from starlette.datastructures import URL as Starlette_URL

from app.data_processing.markdown import convert_to_sections
from app.orchestrator import Orchestrator
app = FastAPI()

DB = {
        "thomascotter00@gmail.com": {
            "notes_file": "notes.md",
        },
        "luizafoster22@gmail.com": {
            "notes_file": "notes.md",
        }
}

REDIRECT_URL = "http://localhost:3000/auth"

sso = GoogleSSO(
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        redirect_uri=REDIRECT_URL,
        # redirect_uri="http://localhost:8000/auth/validate",
        allow_insecure_http=True
)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Url(BaseModel):
    url: str

class User(BaseModel):
    email: str
    notes_file: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# hardcoding index / namespace for now, will be done by authentification later

index = "main-notes"
namespace = "tcotts-notes"

orchestrator = Orchestrator()


@app.get("/auth/login")
async def auth_init() -> Url:
    with sso:
        url = await sso.get_login_url(params={"prompt": "consent", "access_type": "offline"})
        return Url(url=url)

@app.post("/auth/validate")
async def auth_validate(request: dict):
        
    """
    with sso:
        user = await sso.verify_and_process(request)

    return user
    """

    scope = request['scope'].replace(" ", "+").replace(":","%3A").replace("/","%2F")
    authuser = request['authuser'].replace(" ", "+").replace(":","%3A").replace("/","%2F")
    prompt = request['prompt'].replace(" ", "+").replace(":","%3A").replace("/","%2F")
    
    url = "http://localhost:3000/auth?code=" + request['code'] + "&scope=" + scope + "&authuser=" + authuser + "&prompt=" + prompt
    
    url = Starlette_URL(url)
    class DummyRequest:
        def __init__(self, url):
            self.url = url
    with sso:
        user = await sso.process_login(request["code"], DummyRequest(url))
    
    if user.email not in DB:
        return {"error": "User not found"}
    
    return {"error": None, "email": user.email, "notes": DB[user.email]["notes_file"]}

@app.post("/llm")
async def get_response(user_input: dict) -> StreamingResponse:
    """Get response from the model based on the user input."""
    return StreamingResponse(
        orchestrator.query(user_input["message"], False), media_type="text/event-stream"
    )

@app.post("/rag")
async def get_response_with_context(user_input: dict) -> StreamingResponse:
    """Get response from the model based on the user input. Use their notes as context."""
    return StreamingResponse(
        orchestrator.query(
            user_input["message"], True, {"index": index, "namespace": namespace}
        ),
        media_type="text/event-stream",
    )

@app.post("/clear")
def clear_context() -> None:
    """Clear the context of the model."""
    orchestrator.clear_context()

@app.post("/notes")
def get_notes() -> dict:
    """Return the notes of the user."""
    notes_file = Path(__file__).parent.parent / "notes" / "notes.md"
    with open(notes_file, "r") as f:
        notes = f.read()
        return convert_to_sections(notes)

@app.post("/notes/save")
def save_notes(new_notes: dict) -> str:
    """Save the notes of the user."""
    notes_file = Path(__file__).parent.parent / "notes" / "notes.md"
    update_notes(new_notes, notes_file)
    return "success"

def update_notes(new_notes: dict, notes_file: Path) -> None:
    """Update the notes file with the new notes."""
    with open(notes_file, "w") as f:
        for key, value in new_notes.items():
            f.write(f"# {key}\n")
            f.write(f"{value}\n")
