# gpt-cotts

A productivy app.

The MVP for this is essentially a LLM with access to personalized notes - editable in the browser.

## Roadmap for MVP

     - [X] 2 page website with 'Chat' and 'Notes' - React/Next.js
     - [X] Backend to handle LLM and note changes - Fastapi
     - [X] Deployed - Currently running on AWS Lambda
     - [X] Database for notes - S3 / GitHub
     - [X] Authentication - AWS
     - [X] Custom System Prompts

## ToDo List

- Golang script for Github <-> S3
- Hybrid Search with SPLADEv3
- Self-Rag with internet search.
- Multi page notes


## Features

We also of course have plenty of ideas which we want to implement.

    - Interactive 'Chat with your document' - I'm sick of the use cases where the document is hidden from the user, I want real time interaction with the document.
    - Flashcards - Generate flashcards from your notes - geared towards students.
    - 'AI Study Buddy' - Chat with a talking AI, tell them your goals for the session and stay focused with them.
    - 'Schedule' - A calendar for blocking out when you want to do certain general things / projects / individual tasks. I'm on the side of general things (i.e. job / research / exercise), but ig it could be used for individual tasks.
    - Drag & Drop notetaking, which can be imported into your notes.



