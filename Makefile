refresh:
	python3 -m rag.data_processing.refresh --notes=notes.md

run:
	flask --app app.py run --host 0.0.0.0

run-debug:
	flask --app app.py run --debugger --reload

reqs:
	pip freeze > requirements.txt

setup:
	pip install -r requirements.txt
