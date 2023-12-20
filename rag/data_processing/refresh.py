import argparse
from pathlib import Path

from .database.pinecone import upload_to_pinecone
from .preprocessing.embedding import embed_docs
from .preprocessing.markdown import load_and_convert


def main(notes_path: Path, pincone_ip: str, pinecone_index: str):
    data = load_and_convert(notes_path)
    embeddings = embed_docs(data)
    upload_to_pinecone(zip(data, embeddings), pinecone_index)


if __name__ == "__main__":
    argParser = argparse.ArgumentParser()
    argParser.add_argument(
            "--notes",
            help="The path to the notes file",
            required=True,
            type=str
    )
    argParser.add_argument(
            "--pinecone_ip",
            help="The ip address of the pinecone server",
            default="https://main-notes-01ase53.svc.gcp-starter.pinecone.io",
            type=str
    )
    argParser.add_argument(
            "--pinecone_index",
            help="The name of the pinecone index",
            default="main-notes",
            type=str
    )
    args = argParser.parse_args()
    main(Path(args.notes), args.pinecone_ip, args.pinecone_index)
