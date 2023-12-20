"""Refresh the pinecone index with the latest notes.

Usage:
    python3 -m rag.refresh --notes <path_to_notes> --pinecone_index <pinecone_index>
"""
import argparse
from pathlib import Path

from .data_processing.embedding import embed_docs
from .data_processing.markdown import load_and_convert
from .database.pinecone import upload_to_pinecone


def main(notes_path: Path, pinecone_index: str) -> None:
    """Re-embed the notes and upload them to pinecone.

    Args:
        notes_path: The path to the notes file.
        pinecone_index: The name of the pinecone index.
    """
    data = load_and_convert(notes_path)
    embeddings = embed_docs(data)
    upload_to_pinecone(zip(data, embeddings), pinecone_index)


if __name__ == "__main__":
    arg_parser = argparse.ArgumentParser()
    arg_parser.add_argument(
            "--notes",
            help="The path to the notes file",
            required=True,
            type=str
    )
    arg_parser.add_argument(
            "--pinecone_index",
            help="The name of the pinecone index",
            default="main-notes",
            type=str
    )
    args = arg_parser.parse_args()
    main(Path(args.notes), args.pinecone_index)
