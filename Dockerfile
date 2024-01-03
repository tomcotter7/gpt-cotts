FROM python:3.10
WORKDIR /code
COPY ./requirements.txt /code
RUN pip install --no-cache-dir -r /code/requirements.txt
COPY ./.env /code
COPY ./rag /code/rag
CMD ["uvicorn", "rag.main:rag", "--host", "0.0.0.0", "--port", "8000"]

