API_PRICING = {
    "claude-3-5-sonnet-20241022": {
        "input_price_per_one_token": 0.000003,
        "output_price_per_one_token": 0.000015,
    },
    "claude-3-5-haiku-20241022": {
        "input_price_per_one_token": 0.00000008,
        "output_price_per_one_token": 0.000004,
    },
    "claude-3-haiku-20240307": {
        "input_price_per_one_token": 2.5e-7,
        "output_price_per_one_token": 0.00000125,
    },
    "gpt-4o-2024-08-06": {
        "input_price_per_one_token": 0.0000025,
        "output_price_per_one_token": 0.00001,
    },
    "gpt-4o-mini-2024-07-18": {
        "input_price_per_one_token": 1.5e-7,
        "output_price_per_one_token": 6e-7,
    },
    "deepseek-chat": {
        "input_price_per_one_token": 0.00000027,
        "output_price_per_one_token": 0.0000011,
    },
    "default": {
        "input_price_per_one_token": 0.000003,
        "output_price_per_one_token": 0.000015,
    },
}


USER_TABLE = "gptcotts-users"
CHAT_TABLE = "gptcotts-chats"

STARTING_CREDIT = 10  # £10 GBP
DEFAULT_PRICE_MULTIPLIER = 1.075
DEFAULT_USER_CONFIGURATION = {
    "available_credits": STARTING_CREDIT,
    "admin": False,
    "total_input_tokens": 0,
    "total_output_tokens": 0,
}
