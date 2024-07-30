# gpt-cotts

A productivy app.

# Usage

Run the backend locally - 
```bash
python3 backend/app/main.py
```

Run the frontend locally -
```bash
cd frontend
npm run dev
```

You can deploy however is best for you. I'm using AWS Lambda for the backend and Vercel for the frontend.

To set up an s3/pinecone connection to your notes repo, you can use the [action](https://github.com/tomcotter7/gptcotts-github-action) I made.

## TODO List

- [X] Connect notes repo to the app. (via s3)
- [X] Connect notes repo to the app. (via Pinecone)
- [] File / Photo upload.
- [] Chat history
- [] Evaluation logs (ndcg, map, hallucination, model quality).
- [] PDF interaction (highlight, annotate, etc).
- [] 'Scheduler' - AI generate your plan for the day based on previous days.
