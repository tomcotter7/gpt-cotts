# gpt-cotts

A productivity gpt. I have lots of ideas for ways for this to be useful, for now we have two componenents.

	- Containerized React App (In Progress)
        - A Backend-For-Frontend (BFF) React Application, which is very simple and just has access to a ChatGPT-like interface but can perform RAG over your own notes.
    - FastAPI for querying vector db / llm responses (In Progress)

Both of these will be hosted on some cloud service provider - most likely AWS and made avaiable to the public to use over your own notes.

## Roadmap

    - React App
        - [ ] Home page to query notes (EOY 2023)
        - [ ] Page to add notes (EOY 2023)
        - [ ] *AI-Calendar - A calendar which can allow you in input in natural language and it'll populate your calendar for you. This will act more like a schedule, but can access your outlook cal (Jan 2024)
        - [ ] *Note Taking - A page to take notes, would look like a real-life notepad. Notes can be dragged into the storage for querying later (Feb 2024)
        - [ ] *Study Buddy - AI Powered (March 2024)
    - FastAPI
        - [ ] Endpoint to query notes (EOY 2023)
        - [ ] Endpoint to add notes (EOY 2023)
    - Deployment
        - [ ] Deploy to AWS (EOY 2023)

Anything with a * will also require a backend to be built, which will be done in FastAPI. I haven't thought about exactly how I'd do that yet.