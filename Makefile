refresh:
	python3 -m rag.refresh --notes=notes.md

fastapi:
	uvicorn rag.main:rag --reload

setup:
	pip install -r requirements.txt

web:
	cd gpt-cotts-frontend && bun dev
