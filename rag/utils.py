from pathlib import Path

import yaml

config = Path(__file__).parent / "config.yaml"


def load_config(file: Path = config) -> dict:
    with open(file, 'r') as f:
        config = yaml.safe_load(f)
    return config
