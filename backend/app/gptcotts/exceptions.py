class NotEnoughCreditsError(Exception):
    def __str__(self) -> str:
        return "Not enough credits to make this request."
