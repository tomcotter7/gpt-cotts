from typing import Annotated, Any

from fastapi import APIRouter, Depends
from gptcotts import config as cfg
from gptcotts.auth_utils import User, verify_google_token
from gptcotts.credit_utils import cache, validate_credits
from gptcotts.dynamodb_utils import create_new_user, get_table_item, update_table_item

router = APIRouter(prefix="/gptcotts/user_data")


@router.get("/me")
def get_user_data(
    current_user: Annotated[User, Depends(verify_google_token)],
) -> dict[str, Any]:
    return current_user.model_dump()


@router.get("/validate")
def validate_user_credits(
    current_user: Annotated[User, Depends(verify_google_token)],
) -> dict[str, bool]:
    return {"valid": validate_credits(current_user.email)}


@router.get("/usage")
def get_usage_data(current_user: Annotated[User, Depends(verify_google_token)]):
    usage_data = get_table_item(cfg.USER_TABLE, {"email": current_user.email})
    cache.pop((current_user.email,), None)

    if "Item" not in usage_data:  # a.k.a the user has never made a query before.
        create_new_user(current_user.email)
        return cfg.DEFAULT_USER_CONFIGURATION

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


@router.get("/settings")
def get_user_settings(
    current_user: Annotated[User, Depends(verify_google_token)],
) -> dict[str, Any]:
    settings_data = get_table_item(cfg.USER_TABLE, {"email": current_user.email})

    if "Item" not in settings_data:
        create_new_user(current_user.email)
        return cfg.DEFAULT_USER_CONFIGURATION
    settings = settings_data["Item"].get("settings", {"M": {}})["M"]
    settings = {k: v["S"] for k, v in settings.items()}

    return settings


@router.patch("/settings")
def update_user_settings(
    current_user: Annotated[User, Depends(verify_google_token)],
    settings: dict[str, Any],
) -> None:
    f_settings = {key: {"S": str(value).lower()} for key, value in settings.items()}

    update_table_item(
        cfg.USER_TABLE,
        {"email": current_user.email},
        "SET settings = :settings",
        {":settings": {"M": f_settings}},
    )
