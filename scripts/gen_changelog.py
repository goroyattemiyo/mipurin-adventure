"""gen_changelog.py - gitログからCHANGELOGドラフトを生成"""
import subprocess, re, sys

# Get all commits with date
r = subprocess.run(
    ["git", "log", "--oneline", "--format=%h %s"],
    capture_output=True, text=True, encoding="utf-8"
)

commits = r.stdout.strip().split('\n')

# Parse commits by version tag (vX.XX pattern in message)
versions = {}
current_version = "unreleased"

for line in commits:
    if not line.strip():
        continue
    parts = line.split(' ', 1)
    sha = parts[0]
    msg = parts[1] if len(parts) > 1 else ""
    
    # Extract version from message
    ver_match = re.search(r'v(\d+\.\d+(?:\.\d+)?[a-z]?)', msg)
    if ver_match:
        current_version = 'v' + ver_match.group(1)
    
    # Categorize by prefix
    category = "other"
    for prefix in ["feat:", "fix:", "docs:", "test:", "refactor:"]:
        if prefix in msg.lower():
            category = prefix.rstrip(':')
            break
    
    if current_version not in versions:
        versions[current_version] = []
    versions[current_version].append({
        "sha": sha,
        "msg": msg,
        "category": category
    })

# Read existing CHANGELOG
existing = ""
if __import__('os').path.exists('docs/CHANGELOG.md'):
    with open('docs/CHANGELOG.md', 'r', encoding='utf-8') as f:
        existing = f.read()

# Generate draft for missing versions
print("=" * 60)
print("  CHANGELOG DRAFT GENERATOR")
print(f"  Total commits: {len(commits)}")
print(f"  Versions found: {len(versions)}")
print("=" * 60)

# Find versions not in existing CHANGELOG
missing = []
for ver in versions:
    if ver == "unreleased":
        continue
    if ver not in existing:
        missing.append(ver)

if not missing:
    print("\n  All versions already in CHANGELOG.md!")
else:
    print(f"\n  Missing versions: {len(missing)}")
    print("-" * 60)
    
    # Output markdown for missing versions
    output_lines = []
    for ver in sorted(missing, key=lambda v: [int(x) for x in re.findall(r'\d+', v)], reverse=True):
        entries = versions[ver]
        output_lines.append(f"\n## {ver}")
        
        by_cat = {}
        for e in entries:
            by_cat.setdefault(e["category"], []).append(e)
        
        cat_labels = {
            "feat": "Features", "fix": "Fixes", "docs": "Documentation",
            "test": "Tests", "refactor": "Refactoring", "other": "Other"
        }
        
        for cat in ["feat", "fix", "refactor", "docs", "test", "other"]:
            if cat not in by_cat:
                continue
            output_lines.append(f"### {cat_labels.get(cat, cat)}")
            for e in by_cat[cat]:
                # Clean up message
                clean = re.sub(r'^(feat|fix|docs|test|refactor):\s*', '', e["msg"])
                output_lines.append(f"- {clean}")
        
    draft = '\n'.join(output_lines)
    print(draft)
    
    # Save draft
    with open('docs/CHANGELOG_DRAFT.md', 'w', encoding='utf-8', newline='\n') as f:
        f.write("# CHANGELOG Draft (auto-generated)\n")
        f.write("# Review and merge into docs/CHANGELOG.md\n")
        f.write(draft)
    
    print(f"\n[OK] Draft saved to docs/CHANGELOG_DRAFT.md")

print("=" * 60)
