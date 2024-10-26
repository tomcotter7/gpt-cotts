import logging

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import generation, notes, user_data

origins = [
    "https://gptcotts.uk",
    "http://localhost:3000",
    "https://gpt-cotts-git-staging-toms-projects-e1381325.vercel.app",
]
# origins = ["*"]

logging.basicConfig(level=logging.INFO)
load_dotenv()

app = FastAPI()
app.include_router(generation.router)
app.include_router(notes.router)
app.include_router(user_data.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Relevant-Context"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    exc_str = f"{exc}".replace("\n", " ").replace("  ", " ")
    logging.error(f"Validation error: {exc_str}")
    return JSONResponse(status_code=400, content={"message": exc_str})


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
