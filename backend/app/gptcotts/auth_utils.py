from datetime import datetime, timedelta, timezone
from typing import Annotated

import boto3
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from . import config as cfg


class TokenData(BaseModel):
    username: str | None = None

class User(BaseModel):
    username: str
    email: str

class UserInDB(User):
    hashed_password: str
    salt: str


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="gptcotts/auth/token")

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, cfg.jwt_secret_key(), algorithm=cfg.jwt_algorithm())
    return encoded_jwt

def get_user(username: str) -> UserInDB | None:

    client = boto3.client("dynamodb")
    response = client.get_item(
        TableName="gptcotts-users",
        Key={"username": {"S": username}},
    )

    if "Item" in response:
        return UserInDB(
            username=response["Item"]["username"]["S"],
            email=response["Item"]["email"]["S"],
            hashed_password=response["Item"]["hashed_password"]["S"],
            salt=response["Item"]["salt"]["S"],
        )

    return None

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> UserInDB:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, cfg.jwt_secret_key(), algorithms=[cfg.jwt_algorithm()])
        username = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception

    if token_data.username is None:
        raise credentials_exception

    user = get_user(username=token_data.username)
    if user is None:
        raise credentials_exception

    return user

