# noqa: D100
from pathlib import Path

from gptcotts.utils import timing


@timing
def convert_to_markdown(notes: dict) -> str:
    """Convert a dictionary of sections to a markdown file.

    Args:
        notes: Dictionary of sections (strings).

    Returns:
        Markdown file (as a string).
    """
    markdown = ""
    for header, section in notes.items():
        markdown += f"# {header}\n\n{section}\n"
    return markdown


@timing
def convert_to_sections(text: str, max_depth: int = 5) -> dict:
    """Convert a notes file (as a string) to a dictionary of sections.

    This function works best with markdown files that are highly structured.
    Use headers to defined the sections, and limit each section in size.

    Args:
        text: The text of the notes file.
        max_depth: The maximum depth of the sections.
            This is the maximum number of '#' characters at the start of a line.
            If None, there is no limit, the program will calculate the depth.

    Returns:
        Dictionary of sections (strings).
    """
    if max_depth is None:
        max_depth = 0
        for line in text.splitlines():
            if line.startswith("#"):
                level = line.count("#")
                if level > max_depth:
                    max_depth = level

    split_text = text.splitlines()

    header = ""
    sections = {}

    for line in split_text:
        level = line.count("#")
        if line.startswith("#") and level == 1:
            header = line.replace("#", "").strip()

        elif line.startswith("-") or len(line) == 0:
            continue
        else:
            sections[header] = sections.get(header, "") + line + "\n"

    return sections


@timing
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
