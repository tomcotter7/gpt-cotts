import logging
from functools import lru_cache

import requests
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from gptcotts.utils import timing
from pydantic import BaseModel


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str


class UserInDB(User):
    hashed_password: str
    salt: str


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="gptcotts/auth/token")


@timing
@lru_cache(maxsize=10)
def get_user_info(token: str):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo", headers=headers
    )
    if response.status_code == 200:
        return response.json()

    logging.warning(f"Unable to log in via Google. Reason {response}")
    return None


def verify_google_token(token: str = Depends(oauth2_scheme)) -> User:
    user_info = get_user_info(token)
    if user_info is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = User(username=user_info["name"], email=user_info["email"])
    return user
