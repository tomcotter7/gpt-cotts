# noqa: D100
from pathlib import Path

HERE = Path(__file__).parent
notes_file = HERE.parent.parent.parent / "notes.md"

def convert_to_chunks(text: str) -> list[str]:
    """Convert a notes file (as a string) to a list of chunks.

    This function works best with markdown files that are highly structured.
    Use headers to defined the sections, and limit each section in size.

    Args:
        text: The text of the notes file.

    Returns:
        List of chunks (strings).
    """
    headers = {2: "", 3: "", 4: ""}

    contextualized_lines = []
    current_section = ""

    for line in text.splitlines():
        if line.startswith("#"):
            if len(current_section) > 0:
                chunk = f"{headers[2]}: {headers[3]}: {headers[4]}: {current_section}"
                contextualized_lines.append(chunk)
                current_section = ""
            level = line.count("#")
            if level in headers:
                headers[level] = line.replace("#", "").strip()
                for i in range(level + 1, 5):
                    try:
                        headers[i] = ""
                    except KeyError:
                        break

        elif line.startswith("-") or len(line) == 0:
            pass

        else:
            current_section += line + "\n"

    return contextualized_lines


def load_and_convert(notes_file: Path) -> list[str]:
    """Load the notes file and convert it to a list of chunks.

    Args:
        notes_file: Path to the notes file.

    Returns:
        List of chunks (strings).
    """
    with open(notes_file, "r") as f:
        text = f.read()
    chunks = convert_to_chunks(text)
    return chunks
