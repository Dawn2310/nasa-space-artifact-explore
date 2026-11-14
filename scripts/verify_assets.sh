#!/usr/bin/env bash
# Check bundled assets against the checksums recorded in content/assets.json (no network).
set -euo pipefail
cd "$(dirname "$0")/.."
python3 - <<'PY'
import json,hashlib,sys
d=json.load(open("content/assets.json")); bad=0
for a in d["assets"]:
    h=hashlib.sha256(open("public/assets/"+a["localPath"],"rb").read()).hexdigest()
    ok=h==a["sha256"]; bad+=not ok
    print("OK  " if ok else "BAD ",a["localPath"])
sys.exit(1 if bad else 0)
PY
