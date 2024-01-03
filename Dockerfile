FROM python:3.10
WORKDIR /code
COPY ./requirements.txt /code
RUN pip install --no-cache-dir -r /code/requirements.txt
COPY ./rag /code/rag
EXPOSE 8080
CMD ["uvicorn", "rag.main:rag", "--host", "0.0.0.0", "--port", "8080"]

