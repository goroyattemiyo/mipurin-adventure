#!/usr/bin/env python3
"""
Batch process all raw sprites in assets/sprites/raw/ 
-> remove background -> save to assets/sprites/
Usage: python3 tools/process_sprites.py
"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from remove_bg import process

RAW_DIR = 'assets/sprites/raw'
OUT_DIR = 'assets/sprites'

if not os.path.exists(RAW_DIR):
    os.makedirs(RAW_DIR)
    print(f'Created {RAW_DIR}/ - place raw PNGs here')
    sys.exit(0)

files = [f for f in os.listdir(RAW_DIR) if f.endswith('.png')]
if not files:
    print(f'No PNG files in {RAW_DIR}/')
    sys.exit(0)

print(f'Processing {len(files)} sprites...')
for f in sorted(files):
    inp = os.path.join(RAW_DIR, f)
    out = os.path.join(OUT_DIR, f)
    try:
        process(inp, out)
    except Exception as e:
        print(f'ERROR: {f} - {e}')

print('\nDone! Run: git add assets/sprites/ && git commit -m "add sprites" && git push origin v2 --force')
