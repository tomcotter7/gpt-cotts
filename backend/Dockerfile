FROM public.ecr.aws/docker/library/python:3.12.0-slim-bullseye
COPY --from=public.ecr.aws/awsguru/aws-lambda-adapter:0.8.1 /lambda-adapter /opt/extensions/lambda-adapter

WORKDIR /gptcotts
ADD requirements.txt /gptcotts
RUN pip install -r requirements.txt

ADD app /gptcotts/app
ADD cache /gptcotts/cache
ADD .env /gptcotts
RUN python3 -c "from flashrank import Ranker; Ranker(cache_dir='./cache')"

CMD ["python", "app/main.py"]

