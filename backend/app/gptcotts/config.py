import os

from dotenv import load_dotenv

load_dotenv()

def jwt_secret_key() -> str:
    secret_key = os.environ.get("SECRET_KEY", None)

    if secret_key is None:
        raise ValueError("No SECRET_KEY set for authentication")

    return secret_key

def jwt_algorithm() -> str:
    return "HS256"

