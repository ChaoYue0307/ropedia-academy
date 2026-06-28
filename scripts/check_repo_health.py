"""Repo-health check for the model bundles.

Local (default, no network): every models/<id> has a README + correct status files,
and the Space gallery lists exactly the bundles. Exits non-zero on any problem.

  python scripts/check_repo_health.py            # local consistency
  python scripts/check_repo_health.py --online    # also HEAD-check each HF repo exists
"""
import os, sys, glob, re

HF_USER = "cy0307"
APP = "spaces/ropedia-demos/app.py"


def slug(folder): return folder.lower().replace("_", "-")


def main(online=False):
    problems = []
    folders = sorted(os.path.basename(f) for f in glob.glob("models/*") if os.path.isdir(f))
    if not folders:
        print("no model bundles found under models/"); return 1

    trained = placeholders = 0
    for f in folders:
        d = os.path.join("models", f)
        has = lambda n: os.path.exists(os.path.join(d, n))
        if not has("README.md"):
            problems.append(f"{f}: missing README.md")
        if has("metrics.todo.json"):
            placeholders += 1
        elif has("metrics.json") or has("results.json"):
            trained += 1
            if not glob.glob(os.path.join(d, "*.pt")) and not glob.glob(os.path.join(d, "*.npy")):
                # agent harness ships results.json only — allow that
                if not has("results.json"):
                    problems.append(f"{f}: trained but no checkpoint (*.pt / *.npy)")
        else:
            problems.append(f"{f}: no metrics.json / results.json / metrics.todo.json (status unknown)")

    # gallery must list exactly the bundles
    if os.path.exists(APP):
        txt = open(APP).read()
        m = re.search(r"GALLERY\s*=\s*\[(.*?)\]", txt, re.S)
        listed = set(re.findall(r'"([a-z0-9-]+)"', m.group(1))) if m else set()
        expected = {slug(f) for f in folders}
        missing = expected - listed
        extra = listed - expected
        if missing: problems.append(f"Space gallery missing: {sorted(missing)}")
        if extra: problems.append(f"Space gallery has unknown slugs: {sorted(extra)}")

    print(f"bundles: {len(folders)}  ({trained} trained, {placeholders} placeholders)")

    if online:
        import urllib.request
        miss = []
        for f in folders:
            url = f"https://huggingface.co/{HF_USER}/ropedia-{slug(f)}"
            try:
                req = urllib.request.Request(url, method="HEAD")
                urllib.request.urlopen(req, timeout=15)
            except Exception:
                miss.append(f"ropedia-{slug(f)}")
        if miss:
            problems.append(f"HF repos not reachable ({len(miss)}): {miss}")
        else:
            print(f"online: all {len(folders)} HF repos reachable ✓")

    if problems:
        print("\nPROBLEMS:")
        for p in problems: print("  -", p)
        return 1
    print("repo health: OK ✓")
    return 0


if __name__ == "__main__":
    sys.exit(main(online="--online" in sys.argv))
