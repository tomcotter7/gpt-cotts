from cachetools import TTLCache, cached

from . import config as cfg
from .dynamodb_utils import create_new_user, get_table_item

cache = TTLCache(maxsize=10, ttl=300)


# when we add payments, we can do cache.pop(email) to invalidate the cache
@cached(cache=cache)
def validate_credits(email: str) -> bool:
    data = get_table_item(cfg.USER_TABLE, {"email": email})

    if "Item" not in data:
        create_new_user(email)

    available_credits = float(data["Item"].get("available_credits", {"N", 0})["N"])
    admin = str(data["Item"].get("admin", {"S": "false"})["S"]).lower() == "true"

    return available_credits > 0 or admin
