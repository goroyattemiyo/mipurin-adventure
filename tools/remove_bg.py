#!/usr/bin/env python3
"""
Sprite background removal + resize + WebP conversion tool.
Usage: python3 tools/remove_bg.py <input.png> [output.webp]
"""
import sys
from rembg import remove
from PIL import Image
import io

def process(input_path, output_path=None, max_size=256):
    if output_path is None:
        output_path = input_path.rsplit('.', 1)[0] + '.webp'
    with open(input_path, 'rb') as f:
        input_data = f.read()
    output_data = remove(input_data)
    img = Image.open(io.BytesIO(output_data)).convert('RGBA')
    # Trim transparent edges
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    # Resize (keep aspect ratio)
    if img.width > max_size or img.height > max_size:
        ratio = min(max_size / img.width, max_size / img.height)
        new_w = int(img.width * ratio)
        new_h = int(img.height * ratio)
        img = img.resize((new_w, new_h), Image.LANCZOS)
    # Save as WebP with transparency
    img.save(output_path, 'WEBP', quality=90, lossless=False)
    print(f'OK: {input_path} -> {output_path} ({img.width}x{img.height})')
    return output_path

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('Usage: python3 tools/remove_bg.py <input.png> [output.webp]')
        sys.exit(1)
    inp = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else None
    process(inp, out)
