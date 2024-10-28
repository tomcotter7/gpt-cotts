from cachetools import TTLCache, cached

from . import config as cfg
from .dynamodb_utils import get_table_item, update_table_item

cache = TTLCache(maxsize=10, ttl=300)


# when we add payments, we can do cache.pop(email) to invalidate the cache
@cached(cache=cache)
def validate_credits(email: str) -> bool:
    data = get_table_item(cfg.USER_TABLE, {"email": email})

    if "Item" not in data:
        update_table_item(
            cfg.USER_TABLE,
            {
                "email": {"S": email},
                "available_credits": {"N": str(10)},
                "admin": {"S": str(False)},
                "input_tokens": {"N": str(0)},
                "output_tokens": {"N": str(0)},
            },
        )
        return True

    available_credits = float(data["Item"].get("available_credits", {"N", 0})["N"])
    admin = str(data["Item"].get("admin", {"S": "false"})["S"]).lower() == "true"

    return available_credits > 0 or admin
