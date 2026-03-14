---
name: sqlite
description: Query and manage SQLite database files using sqlite3
---

# SQLite (`sqlite3`)

## Open a database

```bash
# Open database file from inbox (user-uploaded) or workspace
sqlite3 inbox/data.db "SELECT count(*) FROM users;"

# Create a new database
sqlite3 /tmp/analysis.db "CREATE TABLE results(id INTEGER PRIMARY KEY, value TEXT);"
```

## Queries

```bash
# Inline query
sqlite3 inbox/data.db "SELECT * FROM users LIMIT 10;"

# Multi-line via heredoc
sqlite3 inbox/data.db << 'EOF'
SELECT u.name, count(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.name
ORDER BY order_count DESC
LIMIT 20;
EOF
```

## Schema inspection

```bash
# List tables
sqlite3 inbox/data.db ".tables"

# Table schema
sqlite3 inbox/data.db ".schema users"

# Column info
sqlite3 inbox/data.db "PRAGMA table_info(users);"

# All indexes
sqlite3 inbox/data.db ".indices"

# Foreign keys
sqlite3 inbox/data.db "PRAGMA foreign_key_list(orders);"

# Database size
ls -lh inbox/data.db
```

## Export

```bash
# CSV export
sqlite3 -header -csv inbox/data.db "SELECT * FROM users;" > outbox/users.csv

# JSON export
sqlite3 -json inbox/data.db "SELECT * FROM users LIMIT 100;" > outbox/users.json

# SQL dump
sqlite3 inbox/data.db ".dump" > outbox/backup.sql

# Dump single table
sqlite3 inbox/data.db ".dump users" > outbox/users.sql
```

## Import

```bash
# CSV import
sqlite3 /tmp/db.sqlite << 'EOF'
.mode csv
.import inbox/data.csv tablename
EOF

# SQL import
sqlite3 /tmp/db.sqlite < inbox/import.sql
```

## Query plans

```bash
sqlite3 inbox/data.db "EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = 'test@example.com';"
```

## Key rules

1. **Input from inbox/** — user-uploaded .db files arrive there
2. **Output to outbox/** — CSV/JSON exports go to outbox/ for delivery
3. **Always LIMIT** large queries
4. **Use `-header -csv`** for clean CSV output
5. **Use `-json`** for JSON output
