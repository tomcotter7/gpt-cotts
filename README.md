# gpt-cotts

A productivity gpt. I have lots of ideas for ways for this to be useful, for now we have two componenents.

	- Containerized React App (In Progress)
        - A Backend-For-Frontend (BFF) React Application, which is very simple and just has access to a ChatGPT-like interface but can perform RAG over your own notes.
    - FastAPI for querying vector db / llm responses (In Progress)

Both of these will be hosted on some cloud service provider - most likely AWS and made avaiable to the public to use over your own notes.

## Roadmap

    - React App
        - [X] Home page to query notes (EOY 2023)
        - [X] Page to edit notes (EOY 2023)
        - [X] Add notes (EOY 2023)
        - [ ] Notes database (EOY 2023)
        - [ ] Edit notes from own laptop - push to db via git (Jan 2024)
    - FastAPI
        - [X] Endpoint to query notes (EOY 2023)
        - [X] Endpoint to edit notes (EOY 2023)
        - [] Endpoint to add notes (EOY 2023)
    - Deployment
        - [ ] Deploy to AWS/Vercel (EOY 2023)

