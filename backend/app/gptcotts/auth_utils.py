import logging

import requests
from cachetools import TTLCache, cached
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from gptcotts.utils import timing
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)


class TokenData(BaseModel):
    username: str | None = None


class User(BaseModel):
    username: str
    email: str


class UserInDB(User):
    hashed_password: str
    salt: str


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="gptcotts/auth/token")

cache = TTLCache(maxsize=100, ttl=300)


@timing
@cached(cache=cache)
def get_user_info(token: str) -> dict | None:
    """Get user info from Google using the token.

    Args:
        token: The Google token.

    Returns:
        The user info, or None if the token is invalid.
    """
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(
        "https://www.googleapis.com/oauth2/v3/userinfo", headers=headers
    )
    logging.debug(response)
    if response.status_code == 200:
        logging.info(f"Able to log in via Google, response {response.json()}")
        return response.json()

    logging.info(f"Unable to log in via Google. Reason {response.text}")
    return None


def verify_google_token(token: str = Depends(oauth2_scheme)) -> User:
    """Verify the Google token and return the user.

    Args:
        token: The Google token.

    Returns:
        The user.
    """
    logging.info(f"attempting to verify token: {token}")
    user_info = get_user_info(token)
    if user_info is None:
        cache.pop((token,), None)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = User(username=user_info["name"], email=user_info["email"])
    return user
