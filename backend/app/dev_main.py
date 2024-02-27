import logging

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI
from routers import generation, notes

logging.basicConfig(level=logging.INFO)
load_dotenv()

app = FastAPI()
app.include_router(generation.router)
app.include_router(notes.router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
