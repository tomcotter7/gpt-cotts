import logging

import boto3

from . import config as cfg
from .utils import timing

client = boto3.client("dynamodb")


def create_new_user(email: str) -> None:
    put_table_item(
        cfg.USER_TABLE,
        {
            "email": {"S": email},
            "available_credits": {
                "N": str(cfg.DEFAULT_USER_CONFIGURATION["available_credits"])
            },
            "admin": {"S": str(cfg.DEFAULT_USER_CONFIGURATION["admin"])},
            "input_tokens": {
                "N": str(cfg.DEFAULT_USER_CONFIGURATION["total_input_tokens"])
            },
            "output_tokens": {
                "N": str(cfg.DEFAULT_USER_CONFIGURATION["total_output_tokens"])
            },
        },
    )


@timing
def batch_update_table_items(table_name: str, items: list[dict]) -> dict:
    response = client.batch_write_item(
        RequestItems={table_name: [{"PutRequest": {"Item": item}} for item in items]}
    )
    return response


@timing
def update_table_item(
    table_name: str,
    key: dict[str, str],
    update_expression: str,
    expression_attribute_values: dict,
) -> dict:
    response = client.update_item(
        TableName=table_name,
        Key={k: {"S": v} for k, v in key.items()},
        UpdateExpression=update_expression,
        ExpressionAttributeValues=expression_attribute_values,
    )
    logging.info(
        f"Updated {key} in {table_name} using {update_expression}. Response: {response}"
    )
    return response


@timing
def put_table_item(table_name: str, item: dict) -> dict:
    response = client.put_item(TableName=table_name, Item=item)
    logging.info(f"Put {item} into {table_name}. Reponse: {response}")
    return response


@timing
def delete_table_item(table_name: str, key: dict[str, str]) -> dict:
    key_request = {k: {"S": v} for k, v in key.items()}
    response = client.delete_item(TableName=table_name, Key=key_request)
    return response


@timing
def get_table_item(table_name: str, key: dict[str, str]) -> dict:
    key_request = {k: {"S": v} for k, v in key.items()}
    response = client.get_item(TableName=table_name, Key=key_request)
    return response


@timing
def get_all_items_with_partition_key(
    table_name: str, key: dict[str, str], projection_expresssion: str
) -> dict:
    k, v = key.popitem()
    response = client.query(
        TableName=table_name,
        KeyConditionExpression=f"{k} = :v",
        ProjectionExpression=projection_expresssion,
        ExpressionAttributeValues={":v": {"S": v}},
    )
    return response
