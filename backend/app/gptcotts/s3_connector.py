import boto3
from gptcotts.utils import timing


@timing
def get_object_from_s3(bucket: str, key: str):
    print(key)
    client = boto3.client('s3')
    response = client.get_object(Bucket=bucket, Key=key)
    return response['Body'].read().decode('utf-8')

@timing
def put_object_to_s3(bucket: str, key: str, body: str):
    client = boto3.client('s3')
    bytes_body = body.encode('utf-8')
    response = client.put_object(Bucket=bucket, Key=key, Body=bytes_body)
    return response
