import os
import uuid
from pathlib import Path

import cohere
from pinecone import Pinecone


def connect_to_pinecone() -> Pinecone:
    pc = Pinecone("6278a3cd-b5b9-4f7c-9aa9-018d9077f3f1")
    return pc


def wipe_namespace(index: str, namespace: str):
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    pc_index.delete(delete_all=True, namespace=namespace)


def connect_to_cohere() -> cohere.Client:
    cohere_api_key = "et5ofO82iS2gDkTxpOwvdTyu9NYtIqYpNo5g3OEG"
    cohere_client = cohere.Client(cohere_api_key)
    return cohere_client


def batch_embed(data: list[dict]) -> list[dict]:
    """Embed a batch of texts using Cohere.

    `data` is a list of dictionaries, where each dictionary has the following keys
        - text: The text to be embedded.
        - header: The header of the text.
        - class: The class of the text

    Args:
        data: The list of dictionaries to be embedded.

    Returns:
        A list of dictionaries containing the embeddings. Of the form, {"id": str, "metadata": dict, "values": np.ndarray}
    """
    results = []
    cohere_client = connect_to_cohere()

    batch_size = int(os.getenv("COHERE_BATCH_SIZE", 96))
    for i in range(0, len(data), batch_size):
        batch = data[i : i + batch_size]
        texts = [d["text"] for d in batch]
        embeddings = cohere_client.embed(
            texts=texts,
            model=os.getenv("COHERE_MODEL", "embed-english-v3.0"),
            input_type="search_query",
        )
        for idx, emb in enumerate(embeddings.embeddings):  # type: ignore
            results.append(
                {
                    "id": str(uuid.uuid4()),
                    "metadata": {
                        "header": data[i + idx]["header"],
                        "class": data[i + idx]["class"],
                        "text": data[i + idx]["text"],
                    },
                    "values": emb,
                }
            )
    return results


def upsert(index: str, namespace: str, data: list[dict]) -> None:
    """Upsert data into a Pinecone index.

    `data` is a list of dictionaries, where each dictionary has the following keys:
        - text: The text to be embedded and stored.
        - header: The header of the text.
        - class: The class of the text.

    Args:
        index: The name of the Pinecone index.
        namespace: The name of the namespace.
        data: The list of dictionaries to be upserted.
    """
    pc = connect_to_pinecone()
    pc_index = pc.Index(index)
    data = batch_embed(data)
    if len(data) == 0:
        print("No data to upsert")
        return

    print(data[0]["metadata"])
    pc_index.upsert(  # type: ignore
        namespace=namespace, vectors=data
    )


def convert_to_chunks(text: str, notes_class: str) -> list[dict]:
    """Convert a notes file (as a string) to a list of chunks.

    This function works best with markdown files that are highly structured.
    Use headers to defined the sections, and limit each section in size.

    Args:
        text: The text of the notes file.
        notes_class: The class of the notes.

    Returns:
        List of chunks (strings).
    """
    headers = {1: "", 2: "", 3: "", 4: ""}

    contextualized_lines = []
    current_section = ""

    for line in text.splitlines():
        if line.startswith("#"):
            if len(current_section) > 0:
                chunk = (
                    ": ".join([val for val in headers.values() if len(val) > 0])
                    + ":"
                    + current_section
                )
                contextualized_lines.append(
                    {"header": headers[1], "class": notes_class, "text": chunk}
                )
                current_section = ""
            level = line.count("#")
            if level in headers:
                headers[level] = line.replace("#", "").strip()
                for i in range(level + 1, 5):
                    try:
                        headers[i] = ""
                    except KeyError:
                        break

        elif len(line) == 0:
            pass

        else:
            current_section += line + "\n"

    if len(current_section) > 0:
        chunk = (
            ": ".join([val for val in headers.values() if len(val) > 0])
            + ":"
            + current_section
        )
        contextualized_lines.append(
            {"header": headers[1], "class": notes_class, "text": chunk}
        )

    return contextualized_lines


def load_and_convert(notes_file: Path, notes_class: str) -> list[dict]:
    """Load the notes file and convert it to a list of chunks.

    Args:
        notes_file: Path to the notes file.
        notes_class: The class of the notes.

    Returns:
        List of chunks (strings).
    """
    with open(notes_file, "r") as f:
        text = f.read()
    chunks = convert_to_chunks(text, notes_class)
    return chunks


files = os.listdir("/home/tcotts/Documents/notes")
files = [f for f in files if f.endswith(".md")]

chunks = [
    load_and_convert(Path(f"/home/tcotts/Documents/notes/{f}"), f.split(".")[0])
    for f in files
]

wipe_namespace("notes", "tcotts-notes")

for chunk in chunks:
    if len(chunk) > 0:
        print(chunk[0]["class"])
    upsert("notes", "tcotts-notes", chunk)
