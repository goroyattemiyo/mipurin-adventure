#!/usr/bin/env python3
"""
Batch process all raw sprites in assets/sprites/raw/
-> remove background -> resize -> WebP -> save to assets/sprites/
Usage: python3 tools/process_sprites.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from remove_bg import process

RAW_DIR = 'assets/sprites/raw'
OUT_DIR = 'assets/sprites'

SIZES = {
    'enemy_': 128,
    'boss_': 192,
    'weapon_': 96,
    'consumable_': 96,
    'drop_': 72,
    'item_': 96
}

def get_max_size(filename):
    for prefix, size in SIZES.items():
        if filename.startswith(prefix):
            return size
    return 128

if not os.path.exists(RAW_DIR):
    os.makedirs(RAW_DIR)
    print(f'Created {RAW_DIR}/ - place raw PNGs here')
    sys.exit(0)

os.makedirs(OUT_DIR, exist_ok=True)

files = [f for f in os.listdir(RAW_DIR) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp'))]
if not files:
    print(f'No image files in {RAW_DIR}/')
    sys.exit(0)

print(f'Processing {len(files)} sprites...')
for f in sorted(files):
    inp = os.path.join(RAW_DIR, f)
    out_name = os.path.splitext(f)[0] + '.webp'
    out = os.path.join(OUT_DIR, out_name)
    max_size = get_max_size(f)
    try:
        process(inp, out, max_size)
    except Exception as e:
        print(f'ERROR: {f} - {e}')

print('\nDone! Sprites saved to assets/sprites/')
