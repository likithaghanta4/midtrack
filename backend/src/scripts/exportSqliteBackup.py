import sqlite3
import json
import os
from pathlib import Path

def export_sqlite_to_json():
    base_dir = Path(__file__).resolve().parent.parent.parent
    db_path = base_dir / "prisma" / "dev.db.backup"
    output_path = base_dir / "data" / "sqlite_dump.json"

    if not db_path.exists():
        # Fallback to dev.db if backup doesn't exist
        db_path = base_dir / "prisma" / "dev.db"

    if not db_path.exists():
        raise FileNotFoundError(f"Database file not found at {db_path}")

    print(f"Reading from: {db_path}")
    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_prisma_migrations'")
    tables = [row["name"] for row in cursor.fetchall()]

    dump_data = {}
    stats = {}

    for table in tables:
        cursor.execute(f'SELECT * FROM "{table}"')
        rows = [dict(row) for row in cursor.fetchall()]
        dump_data[table] = rows
        stats[table] = len(rows)

    conn.close()

    os.makedirs(output_path.parent, exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(dump_data, f, indent=2, ensure_ascii=False)

    print(f"\n=======================================================")
    print(f" SQLITE DATA EXPORT SUMMARY")
    print(f" Saved to: {output_path}")
    print(f"=======================================================")
    for table, count in sorted(stats.items()):
        print(f"  - {table:<15}: {count:>5} records")
    print(f"=======================================================\n")

if __name__ == "__main__":
    export_sqlite_to_json()
