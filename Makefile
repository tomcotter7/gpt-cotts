refresh:
	python3 -m rag.refresh --notes=rag/notes.md

fastapi:
	uvicorn rag.main:rag --reload

reqs:
	pip freeze > requirements.txt

setup:
	pip install -r requirements.txt
