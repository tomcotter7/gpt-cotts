from pathlib import Path

HERE = Path(__file__).parent
notes_file = HERE.parent.parent.parent / "notes.md"


def read_as_str(path: Path) -> str:
    with open(path, "r") as f:
        return f.read()


def convert_to_chunks(text: str) -> list[str]:

    headers = {2: "", 3: "", 4: ""}

    contextualized_lines = []

    for line in text.splitlines():
        if line.startswith("#"):
            level = line.count("#")
            if level in headers:
                headers[level] = line.replace("#", "").strip()

        elif line.startswith("-") or len(line) == 0:
            pass

        else:
            new_line = f"{headers[2]}: {headers[3]}: {headers[4]}: {line}"
            contextualized_lines.append(new_line)

    return contextualized_lines


def load_and_convert() -> list[str]:
    text = read_as_str(notes_file)
    chunks = convert_to_chunks(text)
    return chunks
