import random
import re
from pathlib import Path

from pydub import AudioSegment

keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j','k','l','m','n','o','p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'th', 'sh', ' ', '.']


def get_sounds(pitch: str) -> dict[str, str]:

    sounds = {}

    for index, ltr in enumerate(keys):
        num = index+1
        if num < 10:
            num = "0" + str(num)
        else:
            num = str(num)

        sounds[ltr] = Path(__file__).parent / "sounds" / pitch / f"sound{num}.wav"

    return sounds

def get_rnd_factor(pitch: str) -> float:

    rnd_factor_keys = {'lowest': 0.45, 'low': 0.4, 'med': 0.35, 'high': 0.3}
    rnd_factor = rnd_factor_keys[pitch]

    return rnd_factor

def get_sound_files_from_text(input_text: str, pitch: str) -> list[str]:
    sounds = get_sounds(pitch)
    sound_files = []

    input_text = input_text.lower()
    input_text = re.sub(r'[^a-z\s.]', '', input_text)
    for i, char in enumerate(input_text):
        if char == "s" or char == "t":
            if input_text[i+1] == "h":
                sound_files.append(sounds[input_text[i:i+2]])
            else:
                sound_files.append(sounds[char])
        else:
            try:
                sound_files.append(sounds[char])
            except KeyError:
                pass

    return sound_files


def animalese(input_text: str, pitch: str) -> Path:
    if pitch not in ['lowest', 'low', 'med', 'high']:
        raise ValueError("Pitch must be one of 'lowest', 'low', 'med', or 'high'")

    rnd_factor = get_rnd_factor(pitch)
    sound_files = get_sound_files_from_text(input_text, pitch)
    combined_sound = AudioSegment.empty()
    for sound in sound_files:
        temp_sound = AudioSegment.from_wav(sound)
        octaves = random.random() * rnd_factor + 1.75
        new_sample_rate = int(temp_sound.frame_rate * (2.0 ** octaves))
        new_sound = temp_sound._spawn(temp_sound.raw_data, overrides={'frame_rate': new_sample_rate})
        new_sound = new_sound.set_frame_rate(44100)
        combined_sound = combined_sound + new_sound

    file_path = Path(__file__).parent / "animalese.wav"
    combined_sound = combined_sound.speedup(playback_speed=1.25)
    file_handler = combined_sound.export(file_path, format="wav")
    file_handler.close()

    return file_path

if __name__ == "__main__":
    animalese("Hello, my name is Rag!", "low")
