"""Main file for the gpt-cotts backend.

Usage:
    uvicorn main:app --reload
"""
import httpx
import os
import urllib
from pathlib import Path

from authlib.integrations.starlette_client import OAuth
from fastapi import FastAPI, Request, Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi_sso.sso.google import GoogleSSO
import google.oauth2.credentials
import google_auth_oauthlib.flow
from jose import jwt, JWTError
from pydantic import BaseModel
from starlette.config import Config
from starlette.datastructures import URL as Starlette_URL
from starlette.middleware.sessions import SessionMiddleware
from typing import Optional, Annotated

from app.data_processing.markdown import convert_to_sections
from app.orchestrator import Orchestrator

app = FastAPI()
SECRET_KEY = os.environ.get("SECRET_KEY")
app.add_middleware(SessionMiddleware, secret_key=os.environ.get("SECRET_KEY"))

class DummyRequest:
        def __init__(self, url):
            self.url = url



DB = {
        "thomascotter00@gmail.com": {
            "notes_file": "notes.md",
        },
        "luizafoster22@gmail.com": {
            "notes_file": "notes.md",
        }
}

REDIRECT_URL = "http://localhost:3000/auth"


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
sso = GoogleSSO(
        client_id=os.environ["GOOGLE_CLIENT_ID"],
        client_secret=os.environ["GOOGLE_CLIENT_SECRET"],
        redirect_uri=REDIRECT_URL,
        allow_insecure_http=True
)

origins = ["http://localhost:3000", "https://localhost:3000"]
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

class TokenData(BaseModel):
    email: Optional[str] = None
# hardcoding index / namespace for now, will be done by authentification later

index = "main-notes"
namespace = "tcotts-notes"

orchestrator = Orchestrator()


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> User:

    
    credential_exception = HTTPException(
            status_code = status.HTTP_401_UNAUTHORIZED,
            detail = "pm us on twitter @_tcotts or @luizayaara to get access to the beta",
            headers = {"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        email: str = payload.get("email")
        if email is None:
            raise credential_exception

        token_data = TokenData(email=email)
    except JWTError:
        raise credential_exception

    user = DB.get(token_data.email)
    if user is None:
        raise credential_exception
    

    return User(email=email, notes_file=user["notes_file"])

@app.get("/auth/login")
async def auth_init() -> Url:

    with sso:
        url = await sso.get_login_url(params={"access_type": "offline"}, state=SECRET_KEY)
        return Url(url=url)

@app.post("/auth/validate")
async def auth_validate(request: dict):
        

    scope = request['scope'].replace(" ", "+").replace(":","%3A").replace("/","%2F")
    authuser = request['authuser'].replace(" ", "+").replace(":","%3A").replace("/","%2F")
    prompt = request['prompt'].replace(" ", "+").replace(":","%3A").replace("/","%2F")
    code = request['code'].replace(" ", "+").replace(":","%3A").replace("/","%2F")
    state = request['state'].replace(" ", "+").replace(":","%3A").replace("/","%2F")

    
    url = "https://localhost:3000/auth?code=" + code + "&scope=" + scope + "&authuser=" + authuser + "&prompt=" + prompt
    print(url)
    url = Starlette_URL(url)

    with sso:
        user = await sso.process_login(request["code"], DummyRequest(url))
        access_token = sso.access_token
        expires_in = sso.access_token_expires_in
        refresh_token = sso.refresh_token
    print(user)
    if user.email not in DB:
        raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="pm us on twitter @_tcotts or @luizayaara to get access to the beta",
                headers={"WWW-Authenticate": "Bearer"},
        )

    custom_access_token = jwt.encode({"email": user.email, "expires_in": expires_in}, request['state'], algorithm="HS256")

    return {"access_token": custom_access_token, "token_type": "bearer", "initials": user.email[0:2].upper()}
       

@app.post("/llm")
async def get_response(user_input: dict) -> StreamingResponse:
    """Get response from the model based on the user input."""
    return StreamingResponse(
        orchestrator.query(user_input["message"], False), media_type="text/event-stream"
    )

@app.post("/rag")
async def get_response_with_context(user_input: dict, current_user: Annotated[User, Depends(get_current_user)]) -> StreamingResponse:
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

@app.get("/notes")
def get_notes(current_user: Annotated[User, Depends(get_current_user)]) -> dict:
    """Return the notes of the user."""
    notes_file = Path(__file__).parent.parent / "notes" / current_user.notes_file
    with open(notes_file, "r") as f:
        notes = f.read()
        return convert_to_sections(notes)

@app.get("/current_user_email")
def get_current_user(current_user: Annotated[User, Depends(get_current_user)]) -> User:
    """Return the current user."""
    return current_user

@app.post("/notes/save")
def save_notes(new_notes: dict, current_user: Annotated[User, Depends(get_current_user)]) -> str:
    """Save the notes of the user."""
    notes_file = Path(__file__).parent.parent / "notes" / current_user.notes_file
    update_notes(new_notes, notes_file)
    return "success"

def update_notes(new_notes: dict, notes_file: Path) -> None:
    """Update the notes file with the new notes."""
    with open(notes_file, "w") as f:
        for key, value in new_notes.items():
            f.write(f"# {key}\n")
            f.write(f"{value}\n")
