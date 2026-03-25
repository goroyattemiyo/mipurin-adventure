#!/usr/bin/env python3
"""
process_sprites.py — スプライト前処理スクリプト
入力: assets/sprites/raw/*.png
処理: 背景透明化 → 128x128リサイズ → WebP変換
出力: assets/sprites/*.webp
"""

from PIL import Image
import os, sys

# ============================================================
# 設定定数（必要に応じて変更してください）
# ============================================================

# 透明化する背景色 (R, G, B)
# None を指定するとコーナーピクセルの色を自動検出
BG_COLOR = None

# 背景色の許容誤差（各チャンネル ±tolerance）
BG_TOLERANCE = 30

# 出力サイズ（px）
OUTPUT_SIZE = (128, 128)

# 出力WebP品質（1〜100）
WEBP_QUALITY = 90

# 入出力ディレクトリ
INPUT_DIR  = os.path.join("assets", "sprites", "raw")
OUTPUT_DIR = os.path.join("assets", "sprites")

# ============================================================


def remove_bg(img: Image.Image, bg_color: tuple | None, tolerance: int) -> Image.Image:
    """指定色または左上コーナーの色を背景として透明化する"""
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    if bg_color is None:
        # 左上ピクセルの色を自動検出
        ref = pixels[0, 0][:3]
    else:
        ref = tuple(bg_color[:3])

    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if (abs(r - ref[0]) <= tolerance and
                abs(g - ref[1]) <= tolerance and
                abs(b - ref[2]) <= tolerance):
                pixels[x, y] = (r, g, b, 0)

    return img


def process_file(src_path: str, dst_path: str, overwrite_all: bool) -> str:
    """1ファイルを処理し、結果ステータスを返す ('ok' / 'skip' / 'error')"""
    if os.path.exists(dst_path) and not overwrite_all:
        answer = input(f"  上書き確認: {os.path.basename(dst_path)} は既に存在します。上書きしますか？ [y/N/a(all)] ").strip().lower()
        if answer == 'a':
            return '__all__'   # 呼び出し元が overwrite_all をセットする
        if answer != 'y':
            return 'skip'

    try:
        img = Image.open(src_path)
        img = remove_bg(img, BG_COLOR, BG_TOLERANCE)
        img = img.resize(OUTPUT_SIZE, Image.LANCZOS)
        img.save(dst_path, "WEBP", quality=WEBP_QUALITY)
        return 'ok'
    except Exception as e:
        return f'error: {e}'


def main():
    # raw/ フォルダがなければ作成
    os.makedirs(INPUT_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    png_files = sorted(f for f in os.listdir(INPUT_DIR) if f.lower().endswith(".png"))

    if not png_files:
        print(f"[INFO] {INPUT_DIR} にPNGファイルが見つかりませんでした。")
        sys.exit(0)

    print(f"[INFO] {len(png_files)} 件のPNGを処理します。")
    print(f"[INFO] 背景色: {'自動検出（左上ピクセル）' if BG_COLOR is None else BG_COLOR}  許容誤差: ±{BG_TOLERANCE}")
    print(f"[INFO] 出力サイズ: {OUTPUT_SIZE[0]}x{OUTPUT_SIZE[1]}px  品質: {WEBP_QUALITY}")
    print("-" * 50)

    ok = skip = err = 0
    overwrite_all = "--yes" in sys.argv or "-y" in sys.argv

    for fname in png_files:
        src = os.path.join(INPUT_DIR, fname)
        dst = os.path.join(OUTPUT_DIR, os.path.splitext(fname)[0] + ".webp")

        status = process_file(src, dst, overwrite_all)

        if status == '__all__':
            overwrite_all = True
            # 今のファイルを上書き処理し直す
            status = process_file(src, dst, True)

        if status == 'ok':
            print(f"  [OK]   {fname} → {os.path.basename(dst)}")
            ok += 1
        elif status == 'skip':
            print(f"  [SKIP] {fname}")
            skip += 1
        else:
            print(f"  [ERR]  {fname}  {status}")
            err += 1

    print("-" * 50)
    print(f"[DONE] OK={ok}  SKIP={skip}  ERROR={err}")
    sys.exit(1 if err > 0 else 0)


if __name__ == "__main__":
    main()
