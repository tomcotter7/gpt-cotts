import boto3
import botocore.exceptions
from gptcotts.utils import timing


@timing
def get_all_objects_from_directory(bucket: str, prefix: str) -> list[str]:
    """List all objects in a directory in an S3 bucket.

    Args:
        bucket: The name of the S3 bucket.
        prefix: The prefix of the directory.

    Returns:
        List of filenames in the directory.
    """
    client = boto3.client("s3")
    response = client.list_objects_v2(Bucket=bucket, Prefix=prefix)
    contents = response.get("Contents", [])
    filenames = [
        obj["Key"].replace(prefix + "/", "").replace(".md", "")
        for obj in contents
        if obj["Key"] != prefix + "/"
    ]
    return filenames


@timing
def get_object_from_s3(bucket: str, key: str) -> str:
    """Load a file from an S3 bucket.

    Args:
        bucket: The name of the S3 bucket.
        key: The key of the object.

    Returns:
        The contents of the object.
    """
    client = boto3.client("s3")
    response = client.get_object(Bucket=bucket, Key=key)
    return response["Body"].read().decode("utf-8")


@timing
def put_object_to_s3(bucket: str, key: str, body: str) -> dict:
    """Put an object into an S3 bucket.

    Args:
        bucket: The name of the S3 bucket.
        key: The key of the object.
        body: The contents of the object.

    Returns:
        The response from S3.
    """
    client = boto3.client("s3")
    bytes_body = body.encode("utf-8")
    try:
        response = client.put_object(Bucket=bucket, Key=key, Body=bytes_body)
    except botocore.exceptions.ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchBucket":
            client.create_bucket(Bucket=bucket)
            response = client.put_object(Bucket=bucket, Key=key, Body=bytes_body)
        else:
            raise e
    return response


@timing
def delete_object_from_s3(bucket: str, key: str) -> dict:
    """Delete an object from an S3 bucket.

    Args:
        bucket: The name of the S3 bucket.
        key: The key of the object.

    Returns:
        The response from S3.
    """
    client = boto3.client("s3")
    response = client.delete_object(Bucket=bucket, Key=key)
    return response
