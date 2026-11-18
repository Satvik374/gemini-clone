"""Write recon/openapi.yaml from the running app definition.

Deterministic: sorted keys, no timestamps, no network calls.
Usage: python scripts/export_openapi.py ../recon/openapi.yaml
"""

import sys
from pathlib import Path

import yaml

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app  # noqa: E402


def main() -> int:
    out = Path(sys.argv[1] if len(sys.argv) > 1 else "../recon/openapi.yaml")
    document = app.openapi()
    document["info"]["x-provenance"] = (
        "All operations are INFERRED from the cloned client's requirements; no original "
        "server response was observed (see recon/00-scope.md)."
    )
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(yaml.safe_dump(document, sort_keys=True, allow_unicode=True, width=100))
    print(f"wrote {out} ({len(document['paths'])} paths)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
