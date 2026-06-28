"""Publish every bundle in models/ to the Hugging Face Hub and gather them into one
Collection — with a SINGLE write token, logged in ONCE.

You do NOT need a separate token per repo: one write token authorises every repo
under your account. Get one at https://huggingface.co/settings/tokens (role: Write).

Usage:
    pip install -U huggingface_hub
    huggingface-cli login                  # paste your write token once (or HF_TOKEN=hf_...)
    python scripts/upload_all_to_hf.py            # upload all (trained + placeholders) + collection

Common options:
    --dry-run         show exactly what would happen; no network, no token needed
    --skip-todo       only the trained models (skip 🚧 placeholders)
    --only-todo       only the placeholder repos
    --private-todo    push placeholders private, trained ones public
    --private         everything private
    --org NAME        upload under an org instead of your user
    --no-collection   don't create/update the collection
    --prefix ropedia- repo name prefix

A bundle is a "placeholder" if it contains metrics.todo.json. A model card is
generated only if the folder has no README.md (placeholders ship their own).
"""
import argparse, glob, json, os

COLLECTION_TITLE = "Ropedia Academy — trained models"


def is_placeholder(folder: str) -> bool:
    return os.path.exists(os.path.join(folder, "metrics.todo.json"))


def ensure_card(folder: str) -> None:
    path = os.path.join(folder, "README.md")
    if os.path.exists(path):
        return  # trained cards + placeholder cards already exist
    name = os.path.basename(folder)
    mpath = os.path.join(folder, "metrics.json")
    metrics = json.load(open(mpath)) if os.path.exists(mpath) else {}
    fig = "\n![results](figure.png)\n" if os.path.exists(os.path.join(folder, "figure.png")) else ""
    summary = ", ".join(f"{k}={v}" for k, v in metrics.items() if isinstance(v, (int, float, str)))
    open(path, "w").write(
        "---\nlicense: mit\ntags:\n- ropedia-academy\n- educational\n---\n\n"
        f"# {name}\n\nTrained in **Ropedia Academy** "
        "(https://chaoyue0307.github.io/ropedia-academy/) — an educational lab.\n\n"
        + (f"**Results:** {summary}\n" if summary else "")
        + fig
    )


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--models-dir", default="models")
    ap.add_argument("--prefix", default="ropedia-")
    ap.add_argument("--org", default=None)
    ap.add_argument("--private", action="store_true")
    ap.add_argument("--private-todo", action="store_true", help="placeholders private, trained public")
    ap.add_argument("--skip-todo", action="store_true", help="skip 🚧 placeholder repos")
    ap.add_argument("--only-todo", action="store_true", help="only 🚧 placeholder repos")
    ap.add_argument("--no-collection", action="store_true")
    ap.add_argument("--dry-run", action="store_true", help="print the plan; no token / network needed")
    args = ap.parse_args()

    folders = sorted(p for p in glob.glob(f"{args.models_dir}/*") if os.path.isdir(p))
    if args.skip_todo:
        folders = [f for f in folders if not is_placeholder(f)]
    if args.only_todo:
        folders = [f for f in folders if is_placeholder(f)]
    if not folders:
        raise SystemExit(f"no matching bundles in {args.models_dir}/")

    if args.dry_run:
        ns = args.org or "<your-username>"
        n_ph = sum(is_placeholder(f) for f in folders)
        print(f"DRY RUN — would publish {len(folders)} repos ({len(folders) - n_ph} trained, {n_ph} placeholders) under '{ns}':\n")
        for f in folders:
            slug = args.prefix + os.path.basename(f).lower().replace("_", "-")
            priv = args.private or (args.private_todo and is_placeholder(f))
            tag = "[todo]" if is_placeholder(f) else "[trained]"
            print(f"  {ns}/{slug:42s} {tag:10s} {'private' if priv else 'public'}")
        if not args.no_collection:
            print(f"\nthen create/refresh collection: '{COLLECTION_TITLE}' and add all {len(folders)}.")
        print("\n(re-run without --dry-run, after `huggingface-cli login`, to actually publish.)")
        return

    from huggingface_hub import HfApi, create_collection, add_collection_item
    api = HfApi()
    namespace = args.org or api.whoami()["name"]  # errors clearly if not logged in
    repo_ids = []
    for f in folders:
        ensure_card(f)
        slug = args.prefix + os.path.basename(f).lower().replace("_", "-")
        repo_id = f"{namespace}/{slug}"
        private = args.private or (args.private_todo and is_placeholder(f))
        api.create_repo(repo_id, repo_type="model", exist_ok=True, private=private)
        api.upload_folder(folder_path=f, repo_id=repo_id, commit_message="Upload from Ropedia Academy")
        repo_ids.append(repo_id)
        print("uploaded ->", f"https://huggingface.co/{repo_id}")

    if not args.no_collection:
        col = create_collection(COLLECTION_TITLE, namespace=namespace, exists_ok=True)
        for rid in repo_ids:
            try:
                add_collection_item(col.slug, item_id=rid, item_type="model")
            except Exception as e:
                print("  (collection)", rid, "->", e)
        print("\ncollection ->", f"https://huggingface.co/collections/{col.slug}")

    print(f"\nDone: {len(repo_ids)} repos uploaded with one login.")


if __name__ == "__main__":
    main()
