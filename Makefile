refresh:
	python3 -m rag.data_processing.refresh --notes=notes.md

fastapi:
	uvicorn rag.main:rag --reload

reqs:
	pip freeze > requirements.txt

setup:
	pip install -r requirements.txt
