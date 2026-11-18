"""Build the schema from an empty database, then seed synthetic data.

Usage: python -m scripts.migrate [--no-seed]
"""

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db import Base, SessionLocal, engine  # noqa: E402
from app.seed import DEMO_EMAIL, DEMO_PASSWORD, seed_if_empty  # noqa: E402


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--no-seed", action="store_true", help="create tables only")
    args = parser.parse_args()

    Base.metadata.create_all(engine)
    if not args.no_seed:
        with SessionLocal() as db:
            seed_if_empty(db)
        print(f"seeded demo account {DEMO_EMAIL} / {DEMO_PASSWORD}")
    print("schema ready")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
