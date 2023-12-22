# noqa: D100
from pathlib import Path

def update_sections(sections: dict|str, new_section: dict|str) -> dict|str:
    """Update the sections dictionary with a new section.

    Args:
        sections: The current sections dictionary.
            Could be a string if the section is a leaf.
        new_section: The new section to add to the dictionary.
            Could be a string if the section is a leaf.

    Returns:
        The updated sections dictionary, or a string if the section is a leaf.
    """

    if isinstance(sections, str) and isinstance(new_section, str):
        return sections + "\n" + new_section

    for key in new_section:
        if key in sections:
            sections[key] = update_sections(sections[key], new_section[key])
        else:
            sections[key] = new_section[key]

    return sections


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
    
    headers = {2: "", 3: "", 4: ""}
    sections = {}

    for line in split_text:
        if line.startswith("#"):
            level = line.count("#")
            if level > max_depth:
                raise ValueError(f"Line has too many '#' characters: {line}")
            line = line.replace("#", "").strip()
            if level == 1:
                continue

            if level in headers:
                headers[level] = line
                for i in range(level + 1, max_depth + 1):
                    try:
                        headers[i] = ""
                    except KeyError:
                        break
        elif line.startswith("-") or len(line) == 0:
            continue
        else:
            # headers = {2: "Header 1", 3: "", 4: ""}
            keys = [headers[key] for key in headers.keys() if headers[key] != ""]
            reversed_keys = keys[::-1]
            
            full_section = {reversed_keys[0]: line}
            for i in range(1, len(reversed_keys)):
                full_section = {reversed_keys[i]: full_section}


            sections = update_sections(sections, full_section)
                
    return sections



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

if __name__ == "__main__":
    notes_file = "../../notes.md"
    with open(notes_file, "r") as f:
        text = f.read()
        convert_to_sections(text)

