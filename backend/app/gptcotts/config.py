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
    "claude-3-7-sonnet-20250219": {
        "input_price_per_one_token": 0.000003,
        "output_price_per_one_token": 0.000015,
    },
    "claude-opus-4-20250514": {
        "input_price_per_one_token": 0.000015,
        "output_price_per_one_token": 0.000075,
    },
    "claude-sonnet-4-20250514": {
        "input_price_per_one_token": 0.000003,
        "output_price_per_one_token": 0.000015,
    },
    "gpt-4o-2024-08-06": {
        "input_price_per_one_token": 0.0000025,
        "output_price_per_one_token": 0.00001,
    },
    "gpt-4o-mini-2024-07-18": {
        "input_price_per_one_token": 1.5e-7,
        "output_price_per_one_token": 6e-7,
    },
    "gpt-4.1-2025-04-14": {
        "input_price_per_one_token": 2e-6,
        "output_price_per_one_token": 8e-6,
    },
    "gpt-4.1-mini-2025-04-14": {
        "input_price_per_one_token": 0.0000004,
        "output_price_per_one_token": 1.6e-6,
    },
    "deepseek-chat": {
        "input_price_per_one_token": 0.00000027,
        "output_price_per_one_token": 0.0000011,
    },
    "deepseek-reasoner": {
        "input_price_per_one_token": 0.00000055,
        "output_price_per_one_token": 0.00000219,
    },
    "gemini-2.5-pro-preview-03-25": {
        "input_price_per_one_token": 1.25e-6,
        "output_price_per_one_token": 2.5e-6,
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

REASONING_MODELS = ["deepseek-reasoner", "claude-3-7-sonnet-20250219"]
DEFAULT_NON_REASONING_MODEL = "claude-3-5-sonnet-20241022"
