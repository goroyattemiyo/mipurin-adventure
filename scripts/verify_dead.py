import subprocess, sys

targets = [
    ("fadeOutBGM", "bgm.js"),
    ("drawTitleParticles", "data.js"),
    ("setBlock", "data.js"),
    ("updateTitleParticles", "data.js"),
    ("generateNodes", "nodemap.js"),
    ("drawText", "ui.js"),
]

for name, defined_in in targets:
    r = subprocess.run(
        ["findstr", "/s", "/n", "/c:" + name, "js\\*.js", "index.html"],
        capture_output=True, text=True, encoding="utf-8"
    )
    lines = [l.strip() for l in r.stdout.strip().split('\n') if l.strip()]
    print(f"\n--- {name} (defined in {defined_in}) ---")
    for l in lines:
        print(f"  {l}")
    print(f"  => {len(lines)} occurrences")
