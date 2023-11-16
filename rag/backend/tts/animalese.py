from pydub import AudioSegment
import random
import re
from pathlib import Path

keys = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j','k','l','m','n','o','p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'th', 'sh', ' ', '.']


def get_sounds(pitch: str) -> dict[str, str]:
    
    sounds = {}
    
    for index, ltr in enumerate(keys):
        num = index+1
        if num < 10:
            num = "0" + str(num)
        else:
            num = str(num)
        
        
        sounds[ltr] = f'./sounds/{pitch}/sound{num}.wav'
        
    return sounds
        

def animalese(input_text: str, pitch: str) -> Path:
    
    if pitch not in ['lowest', 'low', 'med', 'high']:
        raise ValueError("Pitch must be one of 'lowest', 'low', 'med', or 'high'")
    
    rnd_factor_keys = {'lowest': 0.45, 'low': 0.4, 'med': 0.35, 'high': 0.3}
    rnd_factor = rnd_factor_keys[pitch]
    
    
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
            sound_files.append(sounds[char])
    
    combined_sound = AudioSegment.empty()           
    for sound in sound_files:
        temp_sound = AudioSegment.from_wav(sound)
        octaves = random.random() * rnd_factor + 1.75
        new_sample_rate = int(temp_sound.frame_rate * (2.0 ** octaves))
        new_sound = temp_sound._spawn(temp_sound.raw_data, overrides={'frame_rate': new_sample_rate})
        new_sound = new_sound.set_frame_rate(44100)
        combined_sound = combined_sound + new_sound
    
    combined_sound.export("./animalese.wav", format="wav")
    
    return Path(__file__).parent / "animalese.wav"