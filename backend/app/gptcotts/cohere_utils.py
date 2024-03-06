import os

import cohere

from .utils import timing


@timing
def connect_to_cohere() -> cohere.Client:
    cohere_api_key = os.getenv("COHERE_API_KEY")
    if cohere_api_key is None:
        raise ValueError("COHERE_API_KEY is not set in the environment")
    cohere_client = cohere.Client(cohere_api_key)
    return cohere_client


