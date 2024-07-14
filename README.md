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

## TODO List

- [] Connect notes repo to the app. (via s3).
- [] File / Photo upload.
- [] Chat history
- [] Evaluation logs (ndcg, map, hallucination, model quality).
- [] PDF interaction (highlight, annotate, etc).
- [] 'Scheduler' - AI generate your plan for the day based on previous days.
