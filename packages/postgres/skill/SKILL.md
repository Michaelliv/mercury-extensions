---
name: postgres
description: Query and manage PostgreSQL databases using psql
---

# PostgreSQL (`psql`)

## Connection

Mercury strips the `MERCURY_` prefix from env vars. Use standard Postgres env vars:

```bash
# These are set automatically from .env
# PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE

# Test connection
psql -c "SELECT version();"

# Or connect with a connection string
psql "postgresql://user:pass@host:5432/dbname"
```

## Quick reference

```bash
# Run a query
psql -c "SELECT * FROM users LIMIT 10;"

# Run query and save to CSV
psql -c "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER" > outbox/users.csv

# Run SQL file
psql -f /tmp/query.sql

# Non-interactive with tuples only (for scripting)
psql -t -A -c "SELECT count(*) FROM users;"
```

## Schema inspection

```bash
# List tables
psql -c "\dt"

# Describe table
psql -c "\d+ users"

# List indexes
psql -c "\di"

# List schemas
psql -c "\dn"

# List all columns for a table
psql -c "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users';"

# List foreign keys
psql -c "SELECT conname, conrelid::regclass, confrelid::regclass FROM pg_constraint WHERE contype = 'f';"
```

## Query patterns

```bash
# SELECT with filtering
psql -c "SELECT id, name, email FROM users WHERE created_at > '2024-01-01' ORDER BY created_at DESC LIMIT 20;"

# Aggregations
psql -c "SELECT status, count(*) FROM orders GROUP BY status;"

# JOINs
psql -c "SELECT u.name, count(o.id) FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.name;"

# JSON queries
psql -c "SELECT data->>'name' FROM events WHERE data->>'type' = 'signup';"
```

## Query plans

```bash
# Explain a query
psql -c "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';"

# Explain with buffers and timing
psql -c "EXPLAIN (ANALYZE, BUFFERS, TIMING) SELECT * FROM large_table WHERE id > 1000;"
```

## Export data

```bash
# CSV export
psql -c "COPY (SELECT * FROM users) TO STDOUT WITH CSV HEADER" > outbox/users.csv

# JSON export
psql -t -A -c "SELECT json_agg(t) FROM (SELECT * FROM users LIMIT 100) t;" > outbox/users.json

# Tab-separated
psql -c "COPY (SELECT * FROM users) TO STDOUT WITH DELIMITER E'\t' HEADER" > outbox/users.tsv
```

## Import data

```bash
# Import CSV
psql -c "COPY users(name, email) FROM STDIN WITH CSV HEADER" < inbox/users.csv

# Insert from values
psql -c "INSERT INTO users(name, email) VALUES ('John', 'john@example.com');"
```

## Database management

```bash
# List databases
psql -c "\l"

# Database size
psql -c "SELECT pg_size_pretty(pg_database_size(current_database()));"

# Table sizes
psql -c "SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) FROM pg_class WHERE relkind = 'r' ORDER BY pg_total_relation_size(oid) DESC LIMIT 10;"

# Active queries
psql -c "SELECT pid, state, query, now() - query_start AS duration FROM pg_stat_activity WHERE state != 'idle' ORDER BY duration DESC;"
```

## Backup and restore

```bash
# Dump database
pg_dump > outbox/backup.sql

# Dump specific table
pg_dump -t users > outbox/users.sql

# Dump as custom format (compressed)
pg_dump -Fc > outbox/backup.dump
```

## Key rules

1. **Default to read-only** — don't modify data unless explicitly asked
2. **Always LIMIT** large queries — use `LIMIT 100` unless the user asks for more
3. **Export to outbox/** — CSV/JSON results go to outbox/ for delivery
4. **Use EXPLAIN first** on complex queries to check performance
5. **Wrap writes in transactions** — `BEGIN; ... COMMIT;` for safety
