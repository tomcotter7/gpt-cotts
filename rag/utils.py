from pathlib import Path  # noqa: D100

import yaml

config = Path(__file__).parent / "config.yaml"


def load_config(file: Path = config) -> dict:
    """Load a yaml config file.

    Args:
        file: Path to the config file.

    Returns:
        A dict containing the config data.
    """
    with open(file, 'r') as f:
        config = yaml.safe_load(f)
    return config
