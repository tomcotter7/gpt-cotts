import boto3

from .utils import timing


@timing
def update_table_item(table_name: str, item: dict) -> dict:
    client = boto3.client("dynamodb")
    response = client.put_item(TableName=table_name, Item=item)
    return response


@timing
def get_table_item(table_name: str, key: dict[str, str]) -> dict:
    k, v = key.popitem()
    client = boto3.client("dynamodb")
    response = client.get_item(TableName=table_name, Key={k: {"S": v}})
    return response
