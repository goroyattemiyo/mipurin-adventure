#!/usr/bin/env python3
"""
process_sprites.py — スプライト前処理スクリプト
入力: assets/sprites/raw/*.png
処理: 背景透明化 → 128x128リサイズ → WebP変換
出力: assets/sprites/*.webp
"""

from PIL import Image
from collections import deque
import os, sys

# ============================================================
# 設定定数（必要に応じて変更してください）
# ============================================================

# 透明化する背景色 (R, G, B)
# None を指定すると四隅ピクセルの平均色を自動検出
BG_COLOR = None

# 背景色の許容誤差（各チャンネル ±TOLERANCE）
# 白背景 + 白いキャラハイライトが消える場合は小さく（例: 8）
# グラデーション背景など境界が曖昧な場合は大きく（例: 30）
TOLERANCE = 15

# 出力サイズ（px）
OUTPUT_SIZE = (128, 128)

# 出力WebP品質（1〜100）
WEBP_QUALITY = 90

# 入出力ディレクトリ
INPUT_DIR  = os.path.join("assets", "sprites", "raw")
OUTPUT_DIR = os.path.join("assets", "sprites")

# ============================================================


def _color_near(c: tuple, ref: tuple, tol: int) -> bool:
    return all(abs(c[i] - ref[i]) <= tol for i in range(3))


def remove_bg(img: Image.Image, bg_color: tuple | None, tolerance: int) -> Image.Image:
    """2段階処理で背景を透明化する。

    Stage 1 — タイトfill:
      全エッジから背景色と非常に近いピクセル（許容 = min(tolerance, 4)）のみを
      flood fill で透明化。キャラ内部への「貫通」を防ぐ。

    Stage 2 — fringe 1パス:
      Stage 1 で透明になったピクセルに隣接し、かつ背景色に近い（許容 = tolerance）
      ピクセルを1回だけ透明化。アンチエイリアス由来の縁取りを除去する。
      反復しないためキャラ内部には侵食しない。
    """
    img = img.convert("RGBA")
    pixels = img.load()
    w, h = img.size

    if bg_color is None:
        # 四隅ピクセルの平均色を背景色として検出
        corners = [pixels[0, 0][:3], pixels[w-1, 0][:3],
                   pixels[0, h-1][:3], pixels[w-1, h-1][:3]]
        ref = tuple(sum(c[i] for c in corners) // 4 for i in range(3))
    else:
        ref = tuple(bg_color[:3])

    # --- Stage 1: タイトflood fill ---
    # tight_tol=2 固定: 背景の非均一な白（252-255）を確実に除去する。
    # ※ 背景色と同色のキャラハイライト（白背景+白キャラ等）は
    #    空間的連結があれば除去される。その場合は raw/ の背景色を
    #    緑・青等に変更するか BG_COLOR を明示指定してください。
    tight_tol = 2
    visited = [[False] * h for _ in range(w)]
    queue = deque()

    def _try_seed(sx, sy):
        if not visited[sx][sy] and _color_near(pixels[sx, sy][:3], ref, tight_tol):
            visited[sx][sy] = True
            queue.append((sx, sy))

    for x in range(w):
        _try_seed(x, 0)
        _try_seed(x, h - 1)
    for y in range(h):
        _try_seed(0, y)
        _try_seed(w - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                if _color_near(pixels[nx, ny][:3], ref, tight_tol):
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    # --- Stage 2: fringe 1パス（反復なし） ---
    to_clear = []
    for y in range(h):
        for x in range(w):
            if pixels[x, y][3] == 0:
                continue
            if not _color_near(pixels[x, y][:3], ref, tolerance):
                continue
            if any(0 <= nx < w and 0 <= ny < h and pixels[nx, ny][3] == 0
                   for nx, ny in ((x-1, y), (x+1, y), (x, y-1), (x, y+1))):
                to_clear.append((x, y))
    for x, y in to_clear:
        r, g, b, a = pixels[x, y]
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
        img = remove_bg(img, BG_COLOR, TOLERANCE)
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
    print(f"[INFO] 背景色: {'自動検出（四隅平均）' if BG_COLOR is None else BG_COLOR}  許容誤差: ±{TOLERANCE}")
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
