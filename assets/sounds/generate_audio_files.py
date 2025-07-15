#!/usr/bin/env python3
"""
Generate audio files for the Whack-a-Mole game
This script creates WAV files that replicate the Web Audio API sounds
"""

import numpy as np
import wave
import struct
import math

def write_wav(filename, samples, sample_rate=44100):
    """Write samples to a WAV file"""
    with wave.open(filename, 'w') as wav_file:
        wav_file.setnchannels(1)  # Mono
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        
        # Convert to 16-bit integers
        samples_int = np.array(samples * 32767, dtype=np.int16)
        wav_file.writeframes(samples_int.tobytes())

def generate_hit_sound():
    """Generate hit sound effect - descending frequency sweep"""
    sample_rate = 44100
    duration = 0.1
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Frequency sweep from 800Hz to 400Hz
    freq_start = 800
    freq_end = 400
    frequency = freq_start + (freq_end - freq_start) * t / duration
    
    # Generate sound with exponential decay
    sound = np.sin(2 * np.pi * frequency * t)
    envelope = np.exp(-t / 0.03)  # Exponential decay
    sound = sound * envelope * 0.3
    
    write_wav('hit.wav', sound)

def generate_mole_pop_sound():
    """Generate mole pop sound - cute upward frequency sweep"""
    sample_rate = 44100
    duration = 0.15
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Frequency sweep from 400Hz to 800Hz to 300Hz
    freq1 = 400 + 400 * np.sin(2 * np.pi * t / 0.03)
    freq2 = 300 * np.ones_like(t)
    frequency = np.where(t < 0.03, freq1, freq2)
    
    # Triangle wave for cute sound
    sound = np.sin(2 * np.pi * frequency * t)
    
    # Bandpass filter effect (simplified)
    envelope = np.exp(-t / 0.05)
    sound = sound * envelope * 0.15
    
    write_wav('mole_pop.wav', sound)

def generate_game_over_sound():
    """Generate game over sound - classic wah-wah-wah descending pattern"""
    sample_rate = 44100
    
    # Three notes with gaps
    notes = [
        {'freq': 440, 'duration': 0.4},  # A4
        {'freq': 370, 'duration': 0.4},  # F#4
        {'freq': 294, 'duration': 0.8},  # D4
    ]
    
    total_duration = sum(note['duration'] for note in notes) + 0.3 * (len(notes) - 1)
    total_samples = int(sample_rate * total_duration)
    sound = np.zeros(total_samples)
    
    sample_pos = 0
    for i, note in enumerate(notes):
        note_duration = note['duration']
        note_samples = int(sample_rate * note_duration)
        t = np.linspace(0, note_duration, note_samples)
        
        # Triangle wave with lowpass filter effect
        note_sound = np.sin(2 * np.pi * note['freq'] * t)
        
        # Add harmonic
        harmonic = np.sin(2 * np.pi * note['freq'] * 1.5 * t) * 0.3
        note_sound += harmonic
        
        # Envelope
        envelope = np.ones_like(t) * 0.1
        envelope[:int(len(t) * 0.1)] = np.linspace(0, 0.15, int(len(t) * 0.1))
        envelope[-int(len(t) * 0.3):] = np.linspace(0.15, 0.001, int(len(t) * 0.3))
        
        note_sound = note_sound * envelope
        
        # Add to main sound
        end_pos = min(sample_pos + note_samples, len(sound))
        sound[sample_pos:end_pos] = note_sound[:end_pos - sample_pos]
        
        # Gap between notes
        sample_pos += note_samples + int(sample_rate * 0.1)
    
    # Add final thud at the end
    thud_start = len(sound) - int(sample_rate * 0.3)
    thud_duration = 0.3
    thud_samples = int(sample_rate * thud_duration)
    t_thud = np.linspace(0, thud_duration, thud_samples)
    
    thud = np.sin(2 * np.pi * 80 * t_thud)  # 80Hz square-ish wave
    thud_envelope = np.exp(-t_thud / 0.1)
    thud = thud * thud_envelope * 0.2
    
    # Add thud to end
    sound = np.concatenate([sound, thud])
    
    write_wav('game_over.wav', sound)

def generate_background_music():
    """Generate energetic gameplay background music"""
    sample_rate = 44100
    loop_duration = 3.0  # 3 second loop
    t = np.linspace(0, loop_duration, int(sample_rate * loop_duration))
    
    # Melody notes with timing
    melody = [
        {'freq': 659, 'start': 0.0, 'duration': 0.2},    # E5
        {'freq': 784, 'start': 0.25, 'duration': 0.2},   # G5
        {'freq': 880, 'start': 0.5, 'duration': 0.2},    # A5
        {'freq': 784, 'start': 0.75, 'duration': 0.2},   # G5
        {'freq': 659, 'start': 1.0, 'duration': 0.4},    # E5
        {'freq': 523, 'start': 1.45, 'duration': 0.2},   # C5
        {'freq': 659, 'start': 1.7, 'duration': 0.4},    # E5
        {'freq': 587, 'start': 2.15, 'duration': 0.2},   # D5
        {'freq': 659, 'start': 2.4, 'duration': 0.2},    # E5
        {'freq': 784, 'start': 2.65, 'duration': 0.2},   # G5
    ]
    
    sound = np.zeros_like(t)
    
    # Add melody
    for note in melody:
        start_sample = int(note['start'] * sample_rate)
        end_sample = int((note['start'] + note['duration']) * sample_rate)
        note_t = t[start_sample:end_sample] - note['start']
        
        if len(note_t) > 0:
            note_sound = np.sin(2 * np.pi * note['freq'] * note_t)
            
            # Envelope
            envelope = np.ones_like(note_t) * 0.08
            if len(envelope) > 10:
                envelope[:5] = np.linspace(0, 0.08, 5)
                envelope[-5:] = np.linspace(0.08, 0, 5)
            
            note_sound = note_sound * envelope
            sound[start_sample:end_sample] += note_sound
    
    # Add bass line
    bass_notes = [262, 330, 392, 330]  # C4, E4, G4, E4
    bass_timing = [0, 0.5, 1.0, 1.5, 2.0, 2.5]
    
    for i, start_time in enumerate(bass_timing):
        if i < len(bass_notes):
            freq = bass_notes[i % len(bass_notes)]
            start_sample = int(start_time * sample_rate)
            duration = 0.4
            end_sample = int((start_time + duration) * sample_rate)
            
            if end_sample <= len(sound):
                bass_t = t[start_sample:end_sample] - start_time
                bass_sound = np.sin(2 * np.pi * freq * bass_t) * 0.05
                sound[start_sample:end_sample] += bass_sound
    
    # Add percussion on beats
    beat_times = [0, 0.5, 1.0, 1.5, 2.0, 2.5]
    for beat_time in beat_times:
        start_sample = int(beat_time * sample_rate)
        perc_duration = 0.1
        end_sample = int((beat_time + perc_duration) * sample_rate)
        
        if end_sample <= len(sound):
            perc_t = np.linspace(0, perc_duration, end_sample - start_sample)
            perc_sound = np.sin(2 * np.pi * 80 * perc_t)
            perc_envelope = np.exp(-perc_t / 0.03)
            perc_sound = perc_sound * perc_envelope * 0.15
            sound[start_sample:end_sample] += perc_sound
    
    write_wav('background_music.wav', sound)

def generate_ambient_sound():
    """Generate cheerful, upbeat cartoon-style background music for Whack-a-Mole"""
    sample_rate = 44100
    loop_duration = 60.0  # 1 minute loop at ~120 BPM
    t = np.linspace(0, loop_duration, int(sample_rate * loop_duration))
    
    # Bouncy 120 BPM timing (0.5s per beat)
    beat_duration = 0.5
    
    # Xylophone-style melody (bright, metallic timbre)
    def xylophone_sound(freq, t_note, duration):
        # Bright attack with harmonics
        fundamental = np.sin(2 * np.pi * freq * t_note)
        harmonic2 = np.sin(2 * np.pi * freq * 2 * t_note) * 0.4
        harmonic3 = np.sin(2 * np.pi * freq * 3 * t_note) * 0.2
        
        sound = fundamental + harmonic2 + harmonic3
        
        # Quick attack, long sustain with decay
        envelope = np.exp(-t_note / (duration * 0.8))
        return sound * envelope * 0.06
    
    # Pizzicato strings effect
    def pizzicato_sound(freq, t_note, duration):
        # Plucked string simulation
        fundamental = np.sin(2 * np.pi * freq * t_note)
        # Add slight tremolo
        tremolo = 1 + 0.15 * np.sin(2 * np.pi * 6 * t_note)
        sound = fundamental * tremolo
        
        # Sharp attack, quick decay
        envelope = np.exp(-t_note / (duration * 0.3))
        return sound * envelope * 0.04
    
    # Quirky brass sound
    def brass_sound(freq, t_note, duration):
        # Square-ish wave for brass character
        fundamental = np.sin(2 * np.pi * freq * t_note)
        # Add odd harmonics for brass timbre
        harmonic3 = np.sin(2 * np.pi * freq * 3 * t_note) * 0.3
        harmonic5 = np.sin(2 * np.pi * freq * 5 * t_note) * 0.15
        
        sound = fundamental + harmonic3 + harmonic5
        
        # Moderate attack and sustain
        envelope = np.ones_like(t_note)
        fade_samples = len(envelope) // 10
        if len(envelope) > fade_samples * 2:
            envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
            envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
        
        return sound * envelope * 0.035
    
    sound = np.zeros_like(t)
    
    # Main melody pattern (4 measures, repeats throughout)
    melody_pattern = [
        # Measure 1
        {'freq': 523, 'start': 0.0, 'duration': 0.25, 'instrument': 'xylophone'},   # C5
        {'freq': 659, 'start': 0.25, 'duration': 0.25, 'instrument': 'xylophone'},  # E5
        {'freq': 784, 'start': 0.5, 'duration': 0.5, 'instrument': 'xylophone'},    # G5
        {'freq': 659, 'start': 1.0, 'duration': 0.25, 'instrument': 'xylophone'},   # E5
        {'freq': 523, 'start': 1.25, 'duration': 0.25, 'instrument': 'xylophone'},  # C5
        {'freq': 587, 'start': 1.5, 'duration': 0.5, 'instrument': 'xylophone'},    # D5
        
        # Measure 2
        {'freq': 659, 'start': 2.0, 'duration': 0.5, 'instrument': 'xylophone'},    # E5
        {'freq': 784, 'start': 2.5, 'duration': 0.25, 'instrument': 'xylophone'},   # G5
        {'freq': 880, 'start': 2.75, 'duration': 0.25, 'instrument': 'xylophone'},  # A5
        {'freq': 784, 'start': 3.0, 'duration': 0.25, 'instrument': 'xylophone'},   # G5
        {'freq': 659, 'start': 3.25, 'duration': 0.25, 'instrument': 'xylophone'},  # E5
        {'freq': 523, 'start': 3.5, 'duration': 0.5, 'instrument': 'xylophone'},    # C5
    ]
    
    # Pizzicato accompaniment pattern
    pizzicato_pattern = [
        {'freq': 262, 'start': 0.0, 'duration': 0.25},   # C4
        {'freq': 330, 'start': 1.0, 'duration': 0.25},   # E4
        {'freq': 262, 'start': 2.0, 'duration': 0.25},   # C4
        {'freq': 294, 'start': 3.0, 'duration': 0.25},   # D4
    ]
    
    # Brass accents
    brass_pattern = [
        {'freq': 523, 'start': 1.75, 'duration': 0.25},  # C5 accent
        {'freq': 659, 'start': 3.75, 'duration': 0.25},  # E5 accent
    ]
    
    # Generate the full track by repeating patterns
    pattern_length = 4.0  # 4 seconds per pattern
    num_patterns = int(loop_duration / pattern_length)
    
    for pattern_num in range(num_patterns):
        pattern_offset = pattern_num * pattern_length
        
        # Add melody
        for note in melody_pattern:
            start_time = note['start'] + pattern_offset
            if start_time < loop_duration:
                start_sample = int(start_time * sample_rate)
                duration = note['duration']
                end_sample = int((start_time + duration) * sample_rate)
                
                if end_sample <= len(sound):
                    note_t = t[start_sample:end_sample] - start_time
                    if len(note_t) > 0:
                        note_sound = xylophone_sound(note['freq'], note_t, duration)
                        sound[start_sample:end_sample] += note_sound
        
        # Add pizzicato every other pattern for variety
        if pattern_num % 2 == 0:
            for note in pizzicato_pattern:
                start_time = note['start'] + pattern_offset
                if start_time < loop_duration:
                    start_sample = int(start_time * sample_rate)
                    duration = note['duration']
                    end_sample = int((start_time + duration) * sample_rate)
                    
                    if end_sample <= len(sound):
                        note_t = t[start_sample:end_sample] - start_time
                        if len(note_t) > 0:
                            note_sound = pizzicato_sound(note['freq'], note_t, duration)
                            sound[start_sample:end_sample] += note_sound
        
        # Add brass accents occasionally
        if pattern_num % 4 == 2:  # Every 4th pattern
            for note in brass_pattern:
                start_time = note['start'] + pattern_offset
                if start_time < loop_duration:
                    start_sample = int(start_time * sample_rate)
                    duration = note['duration']
                    end_sample = int((start_time + duration) * sample_rate)
                    
                    if end_sample <= len(sound):
                        note_t = t[start_sample:end_sample] - start_time
                        if len(note_t) > 0:
                            note_sound = brass_sound(note['freq'], note_t, duration)
                            sound[start_sample:end_sample] += note_sound
    
    # Add light percussion (kick on beats 1 and 3, snare on beats 2 and 4)
    for beat in range(int(loop_duration / beat_duration)):
        beat_time = beat * beat_duration
        start_sample = int(beat_time * sample_rate)
        
        if beat % 4 in [0, 2]:  # Kick drum
            kick_duration = 0.1
            end_sample = int((beat_time + kick_duration) * sample_rate)
            if end_sample <= len(sound):
                kick_t = t[start_sample:end_sample] - beat_time
                kick_sound = np.sin(2 * np.pi * 60 * kick_t) * np.exp(-kick_t / 0.05) * 0.03
                sound[start_sample:end_sample] += kick_sound
        
        elif beat % 4 in [1, 3]:  # Snare drum
            snare_duration = 0.05
            end_sample = int((beat_time + snare_duration) * sample_rate)
            if end_sample <= len(sound):
                snare_t = t[start_sample:end_sample] - beat_time
                # White noise for snare
                noise = np.random.random(len(snare_t)) * 2 - 1
                snare_envelope = np.exp(-snare_t / 0.02)
                snare_sound = noise * snare_envelope * 0.02
                sound[start_sample:end_sample] += snare_sound
    
    # Add occasional cartoon flourishes (slide whistle every 16 seconds)
    for flourish_time in [16, 32, 48]:
        if flourish_time < loop_duration:
            start_sample = int(flourish_time * sample_rate)
            flourish_duration = 0.5
            end_sample = int((flourish_time + flourish_duration) * sample_rate)
            
            if end_sample <= len(sound):
                flourish_t = t[start_sample:end_sample] - flourish_time
                # Slide whistle effect
                start_freq = 1000
                end_freq = 2000
                frequency = start_freq + (end_freq - start_freq) * flourish_t / flourish_duration
                flourish_sound = np.sin(2 * np.pi * frequency * flourish_t)
                flourish_envelope = np.exp(-flourish_t / 0.2)
                flourish_sound = flourish_sound * flourish_envelope * 0.02
                sound[start_sample:end_sample] += flourish_sound
    
    # Normalize and ensure seamless looping
    max_val = np.max(np.abs(sound))
    if max_val > 0:
        sound = sound / max_val * 0.85  # Leave headroom
    
    # Fade in/out the first/last 100ms for seamless looping
    fade_samples = int(0.1 * sample_rate)
    sound[:fade_samples] *= np.linspace(0, 1, fade_samples)
    sound[-fade_samples:] *= np.linspace(1, 0, fade_samples)
    
    write_wav('ambient_music.wav', sound)

def generate_explosion_sound():
    """Generate explosion sound effect - dramatic boom with rumble"""
    sample_rate = 44100
    duration = 0.8
    t = np.linspace(0, duration, int(sample_rate * duration))
    
    # Multiple layers for rich explosion sound
    sound = np.zeros_like(t)
    
    # Layer 1: Initial sharp crack (high frequency noise burst)
    crack_duration = 0.05
    crack_samples = int(crack_duration * sample_rate)
    crack_noise = np.random.normal(0, 0.3, crack_samples)
    crack_envelope = np.exp(-np.linspace(0, 20, crack_samples))
    crack_sound = crack_noise * crack_envelope
    sound[:crack_samples] += crack_sound
    
    # Layer 2: Mid-frequency boom (sine wave sweep)
    boom_start = 0.02
    boom_duration = 0.3
    boom_start_sample = int(boom_start * sample_rate)
    boom_end_sample = int((boom_start + boom_duration) * sample_rate)
    boom_t = t[boom_start_sample:boom_end_sample] - boom_start
    
    # Frequency sweep from 200Hz to 50Hz
    freq_start = 200
    freq_end = 50
    frequency = freq_start + (freq_end - freq_start) * boom_t / boom_duration
    boom_wave = np.sin(2 * np.pi * frequency * boom_t)
    boom_envelope = np.exp(-boom_t / 0.15)
    boom_sound = boom_wave * boom_envelope * 0.4
    sound[boom_start_sample:boom_end_sample] += boom_sound
    
    # Layer 3: Low-frequency rumble (bass component)
    rumble_start = 0.1
    rumble_duration = 0.6
    rumble_start_sample = int(rumble_start * sample_rate)
    rumble_end_sample = int((rumble_start + rumble_duration) * sample_rate)
    rumble_t = t[rumble_start_sample:rumble_end_sample] - rumble_start
    
    # Low frequency rumble with modulation
    rumble_freq = 40 + 20 * np.sin(2 * np.pi * 5 * rumble_t)
    rumble_wave = np.sin(2 * np.pi * rumble_freq * rumble_t)
    rumble_envelope = np.exp(-rumble_t / 0.3)
    rumble_sound = rumble_wave * rumble_envelope * 0.3
    sound[rumble_start_sample:rumble_end_sample] += rumble_sound
    
    # Layer 4: Debris/crackling (filtered noise)
    debris_start = 0.15
    debris_duration = 0.4
    debris_start_sample = int(debris_start * sample_rate)
    debris_end_sample = int((debris_start + debris_duration) * sample_rate)
    debris_noise = np.random.normal(0, 0.15, debris_end_sample - debris_start_sample)
    debris_envelope = np.exp(-np.linspace(0, 8, debris_end_sample - debris_start_sample))
    debris_sound = debris_noise * debris_envelope
    sound[debris_start_sample:debris_end_sample] += debris_sound
    
    # Apply overall envelope to smooth the sound
    overall_envelope = np.ones_like(t)
    fade_samples = int(0.1 * sample_rate)
    if len(overall_envelope) > fade_samples:
        overall_envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
    
    sound = sound * overall_envelope
    
    # Normalize to prevent clipping
    max_val = np.max(np.abs(sound))
    if max_val > 0:
        sound = sound / max_val * 0.8
    
    write_wav('explosion.wav', sound)

def generate_hammer_hit_sound():
    """Generate hammer hitting sound - sharp metallic strike"""
    sample_rate = 44100
    duration = 0.3
    samples = np.zeros(int(sample_rate * duration))
    
    # Generate initial strike - sharp attack
    strike_duration = 0.05
    strike_samples = int(sample_rate * strike_duration)
    
    # Create metallic ping with harmonics
    t = np.linspace(0, strike_duration, strike_samples)
    
    # Primary frequency (metallic ping)
    freq1 = 800
    freq2 = 1200
    freq3 = 1600
    
    # Generate strike with harmonics
    strike = (np.sin(2 * np.pi * freq1 * t) * 0.6 +
             np.sin(2 * np.pi * freq2 * t) * 0.3 +
             np.sin(2 * np.pi * freq3 * t) * 0.1)
    
    # Add some noise for realism
    noise = np.random.normal(0, 0.1, strike_samples)
    strike = strike + noise
    
    # Sharp attack envelope
    attack_envelope = np.exp(-t * 40)
    strike = strike * attack_envelope
    
    # Add reverb tail
    reverb_duration = 0.25
    reverb_samples = int(sample_rate * reverb_duration)
    reverb_t = np.linspace(0, reverb_duration, reverb_samples)
    
    # Generate reverb with decaying harmonics
    reverb = (np.sin(2 * np.pi * freq1 * 0.8 * reverb_t) * 0.2 +
             np.sin(2 * np.pi * freq2 * 0.7 * reverb_t) * 0.1)
    
    # Decay envelope for reverb
    reverb_envelope = np.exp(-reverb_t * 8)
    reverb = reverb * reverb_envelope
    
    # Combine strike and reverb
    samples[:strike_samples] += strike
    samples[strike_samples:strike_samples+reverb_samples] += reverb
    
    # Normalize
    samples = samples / np.max(np.abs(samples)) * 0.9
    
    write_wav('hammer_hit.wav', samples)

def generate_button_click_sound():
    """Generate button click sound - soft digital click"""
    sample_rate = 44100
    duration = 0.15
    samples = np.zeros(int(sample_rate * duration))
    
    # Generate click - two-tone beep
    click_duration = 0.05
    click_samples = int(sample_rate * click_duration)
    
    t = np.linspace(0, click_duration, click_samples)
    
    # First tone (higher)
    freq1 = 1000
    tone1 = np.sin(2 * np.pi * freq1 * t)
    
    # Second tone (lower)
    freq2 = 800
    tone2 = np.sin(2 * np.pi * freq2 * t)
    
    # Combine tones with slight delay
    click = tone1 * 0.6
    
    # Add second tone with delay
    delay_samples = int(sample_rate * 0.02)
    if delay_samples < click_samples:
        click[delay_samples:] += tone2[:click_samples-delay_samples] * 0.4
    
    # Apply envelope
    envelope = np.exp(-t * 20)
    click = click * envelope
    
    # Add to samples
    samples[:click_samples] += click
    
    # Normalize
    samples = samples / np.max(np.abs(samples)) * 0.7
    
    write_wav('button_click.wav', samples)

def generate_ting_sound():
    """Generate ting sound - bright metallic chime for successful mole hits"""
    sample_rate = 44100
    duration = 0.5
    samples = np.zeros(int(sample_rate * duration))
    
    # Generate bright metallic ting - bell-like sound
    ting_duration = 0.1
    ting_samples = int(sample_rate * ting_duration)
    
    t = np.linspace(0, ting_duration, ting_samples)
    
    # Primary frequencies for bright metallic ting
    freq1 = 1800  # Bright fundamental
    freq2 = 2400  # First harmonic
    freq3 = 3200  # Second harmonic
    freq4 = 4000  # Third harmonic
    
    # Generate ting with harmonics
    ting = (np.sin(2 * np.pi * freq1 * t) * 0.5 +
            np.sin(2 * np.pi * freq2 * t) * 0.3 +
            np.sin(2 * np.pi * freq3 * t) * 0.15 +
            np.sin(2 * np.pi * freq4 * t) * 0.05)
    
    # Bell-like attack and decay envelope
    attack_samples = int(sample_rate * 0.01)  # Very quick attack
    decay_samples = ting_samples - attack_samples
    
    envelope = np.ones(ting_samples)
    if attack_samples > 0:
        envelope[:attack_samples] = np.linspace(0, 1, attack_samples)
    if decay_samples > 0:
        envelope[attack_samples:] = np.exp(-np.linspace(0, 6, decay_samples))
    
    ting = ting * envelope
    
    # Add reverb tail for sparkle effect
    reverb_start = ting_samples
    reverb_duration = 0.4
    reverb_samples = int(sample_rate * reverb_duration)
    reverb_t = np.linspace(0, reverb_duration, reverb_samples)
    
    # Generate sparkling reverb with higher frequencies
    reverb = (np.sin(2 * np.pi * freq1 * 0.9 * reverb_t) * 0.15 +
              np.sin(2 * np.pi * freq2 * 0.8 * reverb_t) * 0.1 +
              np.sin(2 * np.pi * freq3 * 0.7 * reverb_t) * 0.05)
    
    # Exponential decay for reverb
    reverb_envelope = np.exp(-reverb_t * 4)
    reverb = reverb * reverb_envelope
    
    # Combine ting and reverb
    samples[:ting_samples] += ting
    samples[reverb_start:reverb_start+reverb_samples] += reverb
    
    # Normalize
    samples = samples / np.max(np.abs(samples)) * 0.8
    
    write_wav('ting.wav', samples)

if __name__ == "__main__":
    print("Generating audio files...")
    
    generate_hit_sound()
    print("✓ Generated hit.wav")
    
    generate_mole_pop_sound()
    print("✓ Generated mole_pop.wav")
    
    generate_game_over_sound()
    print("✓ Generated game_over.wav")
    
    generate_background_music()
    print("✓ Generated background_music.wav")
    
    generate_ambient_sound()
    print("✓ Generated ambient_music.wav")
    
    generate_explosion_sound()
    print("✓ Generated explosion.wav")
    
    generate_hammer_hit_sound()
    print("✓ Generated hammer_hit.wav")
    
    generate_button_click_sound()
    print("✓ Generated button_click.wav")
    
    generate_ting_sound()
    print("✓ Generated ting.wav")
    
    print("All audio files generated successfully!")