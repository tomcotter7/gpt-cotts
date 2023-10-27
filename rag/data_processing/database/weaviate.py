import weaviate


def auth(weaviate_ip: str) -> weaviate.Client:

    client = weaviate.Client("http://{}:8080".format(weaviate_ip))
    return client


def refresh_schema(client: weaviate.Client) -> None:

    client.schema.delete_class("Chunk")
    chunk_obj = {
        "class": "Chunk",
        "vectorizer": "text2vec-transformers",
        "moduleConfig": {
            "model": "sentence-transformers/multi-qa-mpnet-base-cos-v1"
            }
    }
    client.schema.create_class(chunk_obj)


def upload_to_weaviate(data: list[str], weaviate_ip: str) -> None:

    client = auth(weaviate_ip)
    refresh_schema(client)

    data_objects = [{"data": chunk} for chunk in data]
    client.batch.configure(batch_size=100)
    print(f"Uploading {len(data_objects)} chunks.")
    i = 0
    with client.batch as batch:
        for data_obj in data_objects:
            batch.add_data_object(data_obj, "Chunk")
            i += 1
            if i % 10 == 0:
                print(f"Uploaded {i} chunks.")


def query_weaviate(query: str, weaviate_ip: str) -> list[str]:

    client = auth(weaviate_ip)
    response = (
        client.query.get("Chunk", ["data"])
        .with_hybrid(query=query)
        .with_limit(2)
        .do()
    )

    return [chunk["data"] for chunk in response["data"]["Get"]["Chunk"]]
