refresh:
	python3 -m rag.refresh --notes=rag/notes.md

fastapi:
	uvicorn api.main:rag --reload

setup:
	pip install -r requirements.txt

web:
	npm run next-dev

docker:
	docker build -t gptcotts-fastapi .

gcp:
	gcloud run deploy gpt-cotts --set-env-vars="OPENAI_API_KEY=${OPENAI_API_KEY}" --port 8000 --memory 2Gi --source .
