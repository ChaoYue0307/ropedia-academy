"""Publish every trained bundle in models/ to the Hugging Face Hub and gather them
into one Collection — with a SINGLE write token, logged in ONCE.

You do NOT need a separate token per repo: one write token authorises every repo
under your account. Get one at https://huggingface.co/settings/tokens (role: Write).

Usage:
    pip install -U huggingface_hub
    huggingface-cli login            # paste your write token once  (or set HF_TOKEN=hf_...)
    python scripts/upload_all_to_hf.py            # uploads all + makes the collection
    python scripts/upload_all_to_hf.py --org my-org --prefix ropedia-   # options

Each models/<name>/ folder becomes a repo "<user-or-org>/<prefix><name>" and is
added to a collection titled below. A basic model card is generated if missing.
"""
import argparse, glob, json, os
from huggingface_hub import HfApi, create_collection, add_collection_item

COLLECTION_TITLE = "Ropedia Academy — trained models"


def ensure_card(folder: str) -> None:
    """Write a simple model card (README.md) if the bundle doesn't already have one."""
    path = os.path.join(folder, "README.md")
    if os.path.exists(path):
        return
    name = os.path.basename(folder)
    mpath = os.path.join(folder, "metrics.json")
    metrics = json.load(open(mpath)) if os.path.exists(mpath) else {}
    fig = "\n![results](figure.png)\n" if os.path.exists(os.path.join(folder, "figure.png")) else ""
    summary = ", ".join(f"{k}={v}" for k, v in metrics.items() if isinstance(v, (int, float, str)))
    open(path, "w").write(
        "---\nlicense: mit\ntags:\n- ropedia-academy\n- educational\n---\n\n"
        f"# {name}\n\nTrained from scratch in **Ropedia Academy** "
        "(https://chaoyue0307.github.io/ropedia-academy/) — an educational lab. "
        "The checkpoint and full loss/eval history (`metrics.json`) are included.\n\n"
        + (f"**Results:** {summary}\n" if summary else "")
        + fig
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--models-dir", default="models")
    ap.add_argument("--prefix", default="ropedia-")
    ap.add_argument("--org", default=None, help="upload under an org instead of your user")
    ap.add_argument("--private", action="store_true")
    ap.add_argument("--no-collection", action="store_true")
    args = ap.parse_args()

    api = HfApi()
    namespace = args.org or api.whoami()["name"]  # fails clearly if you're not logged in
    folders = sorted(p for p in glob.glob(f"{args.models_dir}/*") if os.path.isdir(p))
    if not folders:
        raise SystemExit(f"no bundles found in {args.models_dir}/")

    repo_ids = []
    for f in folders:
        ensure_card(f)
        slug = args.prefix + os.path.basename(f).lower().replace("_", "-")
        repo_id = f"{namespace}/{slug}"
        api.create_repo(repo_id, repo_type="model", exist_ok=True, private=args.private)
        api.upload_folder(folder_path=f, repo_id=repo_id, commit_message="Upload from Ropedia Academy")
        repo_ids.append(repo_id)
        print("uploaded ->", f"https://huggingface.co/{repo_id}")

    if not args.no_collection:
        col = create_collection(COLLECTION_TITLE, namespace=namespace, exists_ok=True)
        for rid in repo_ids:
            try:
                add_collection_item(col.slug, item_id=rid, item_type="model")
            except Exception as e:  # already in the collection, etc.
                print("  (collection)", rid, "->", e)
        print("\ncollection ->", f"https://huggingface.co/collections/{col.slug}")

    print(f"\nDone: {len(repo_ids)} repos uploaded with one login.")


if __name__ == "__main__":
    main()
