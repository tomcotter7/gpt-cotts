from .database.weaviate import upload_to_weaviate
from .preprocessing.markdown import load_and_convert
from pathlib import Path
import argparse


notes_path = (
        Path(__file__)
        .parent
        .parent
        .parent / "research_notes" / "notes.md"
)


def main(weaviate_ip: str = "localhost", notes_path: Path = notes_path):
    data = load_and_convert(notes_path)
    upload_to_weaviate(data, weaviate_ip)


if __name__ == "__main__":
    argParser = argparse.ArgumentParser()
    argParser.add_argument(
            "--weaviate",
            help="The address of the Weaviate instance.",
            required=True,
            type=str
    )
    argParser.add_argument(
            "--notes",
            help="The path to the notes file",
            required=True,
            type=str
    )
    args = argParser.parse_args()
    main(args.weaviate, Path(args.notes))
