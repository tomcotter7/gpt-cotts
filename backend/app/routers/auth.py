import os
import random
import string
from datetime import timedelta
from typing import Annotated

import boto3
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from gptcotts.auth_utils import (
    User,
    UserInDB,
    create_access_token,
    get_current_user,
    get_user,
)
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr

router = APIRouter(
    prefix="/gptcotts/auth",
)
load_dotenv()
SECRET_KEY = os.environ.get("SECRET_KEY", None)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
if SECRET_KEY is None:
    raise ValueError("No SECRET_KEY set for authentication")

class OAuth2PasswordRequestFormWithEmail(OAuth2PasswordRequestForm):
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str


class SignUpForm(BaseModel):
    username: str
    email: str
    password: str

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, salt: str, hashed_password: str) -> bool:
    return pwd_context.verify(salt + plain_password, hashed_password)

def get_password_hash(password: str, salt: str) -> str:
    return pwd_context.hash(salt + password)



def authenticate_user(username: str, password: str) -> UserInDB | None:
        user = get_user(username)
        if user is None:
            return None

        if not verify_password(password, user.salt, user.hashed_password):
            return None

        return user


@router.post("/token")
async def login_for_access_token(
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:

    user = authenticate_user(form_data.username, form_data.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")

@router.get("/users/me")
async def read_users_me(
        current_user: Annotated[User, Depends(get_current_user)]
):
    return current_user

@router.post("/signup")
async def signup(
        email: EmailStr,
        form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:

    if email != "thomascotter00@gmail.com":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email",
        )

    salt = "".join(random.choices(string.ascii_letters + string.digits, k=16))
    hashed_password = get_password_hash(form_data.password, salt)

    user = get_user(form_data.username)
    if user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    client = boto3.client("dynamodb")
    response = client.put_item(
        TableName="gptcotts-users",
        Item={
            "username": {"S": form_data.username},
            "email": {"S": email},
            "hashed_password": {"S": hashed_password},
            "salt": {"S": salt},
        },
    )

    if response["ResponseMetadata"]["HTTPStatusCode"] != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")
