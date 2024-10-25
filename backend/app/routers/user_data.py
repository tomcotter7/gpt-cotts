from typing import Annotated

from fastapi import APIRouter, Depends
from gptcotts import config as cfg
from gptcotts.auth_utils import User, verify_google_token
from gptcotts.credit_utils import cache, validate_credits
from gptcotts.dynamodb_utils import get_table_item, update_table_item

router = APIRouter(prefix="/gptcotts/user_data")


@router.get("/me")
def get_user_data(current_user: Annotated[User, Depends(verify_google_token)]):
    return current_user.model_dump()


@router.get("/validate")
def validate_user_credits(current_user: Annotated[User, Depends(verify_google_token)]):
    return {"valid": validate_credits(current_user.email)}


@router.get("/usage")
def get_usage_data(current_user: Annotated[User, Depends(verify_google_token)]):
    usage_data = get_table_item(cfg.USER_TABLE, {"email": current_user.email})
    cache.pop((current_user.email,), None)

    if "Item" not in usage_data:
        update_table_item(
            cfg.USER_TABLE,
            {
                "email": {"S": current_user.email},
                "available_credits": {"N": str(10)},
                "admin": {"S": str(False)},
                "input_tokens": {"N": str(0)},
                "output_tokens": {"N": str(0)},
            },
        )

        return {
            "available_credits": 10,
            "admin": False,
            "total_input_tokens": 0,
            "total_output_tokens": 0,
        }

    available_credits = round(
        float(usage_data["Item"].get("available_credits", {"N": 0})["N"]), 2
    )
    admin = str(usage_data["Item"].get("admin", {"S": "false"})["S"]).lower() == "true"
    input_tokens = int(usage_data["Item"].get("input_tokens", {"N": 0})["N"])
    output_tokens = int(usage_data["Item"].get("output_tokens", {"N": 0})["N"])

    return {
        "available_credits": available_credits,
        "admin": admin,
        "total_input_tokens": input_tokens,
        "total_output_tokens": output_tokens,
    }
