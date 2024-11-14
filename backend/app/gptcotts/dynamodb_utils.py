import boto3

from .utils import timing


@timing
def batch_update_table_items(table_name: str, items: list[dict]) -> dict:
    client = boto3.client("dynamodb")
    response = client.batch_write_item(
        RequestItems={table_name: [{"PutRequest": {"Item": item}} for item in items]}
    )
    return response


@timing
def update_table_item(table_name: str, item: dict) -> dict:
    client = boto3.client("dynamodb")
    response = client.put_item(TableName=table_name, Item=item)
    return response


@timing
def delete_table_item(table_name: str, key: dict[str, str]) -> dict:
    key_request = {k: {"S": v} for k, v in key.items()}

    client = boto3.client("dynamodb")
    response = client.delete_item(TableName=table_name, Key=key_request)
    return response


@timing
def get_table_item(table_name: str, key: dict[str, str]) -> dict:
    key_request = {k: {"S": v} for k, v in key.items()}

    client = boto3.client("dynamodb")
    response = client.get_item(TableName=table_name, Key=key_request)
    return response


@timing
def get_all_items_with_partition_key(
    table_name: str, key: dict[str, str], projection_expresssion: str
) -> dict:
    k, v = key.popitem()
    client = boto3.client("dynamodb")
    response = client.query(
        TableName=table_name,
        KeyConditionExpression=f"{k} = :v",
        ProjectionExpression=projection_expresssion,
        ExpressionAttributeValues={":v": {"S": v}},
    )
    return response
