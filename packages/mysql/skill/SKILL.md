---
name: mysql
description: Query and manage MySQL/MariaDB databases using the mysql client
---

# MySQL (`mysql`)

## Connection

```bash
# Using env vars (MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE)
mysql -e "SELECT version();"

# Explicit connection
mysql -h "$MYSQL_HOST" -P "$MYSQL_PORT" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" -e "SELECT 1;"
```

## Queries

```bash
# Run a query
mysql -e "SELECT * FROM users LIMIT 10;"

# Save to CSV
mysql -B -e "SELECT * FROM users;" | tr '\t' ',' > outbox/users.csv

# Non-interactive, no headers
mysql -B -N -e "SELECT count(*) FROM users;"

# Run SQL file
mysql < /tmp/query.sql
```

## Schema inspection

```bash
# List tables
mysql -e "SHOW TABLES;"

# Describe table
mysql -e "DESCRIBE users;"

# Show create statement
mysql -e "SHOW CREATE TABLE users\G"

# List indexes
mysql -e "SHOW INDEX FROM users;"

# List databases
mysql -e "SHOW DATABASES;"

# Table sizes
mysql -e "SELECT table_name, ROUND(data_length/1024/1024, 2) AS size_mb FROM information_schema.tables WHERE table_schema = DATABASE() ORDER BY data_length DESC;"
```

## Query plans

```bash
mysql -e "EXPLAIN SELECT * FROM users WHERE email = 'test@example.com';"
mysql -e "EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';"
```

## Export

```bash
# CSV with headers
mysql -B -e "SELECT * FROM users;" | sed 's/\t/,/g' > outbox/users.csv

# mysqldump
mysqldump "$MYSQL_DATABASE" > outbox/backup.sql
mysqldump "$MYSQL_DATABASE" users > outbox/users.sql
```

## Import

```bash
# SQL file
mysql < inbox/data.sql

# CSV via LOAD DATA (if file is accessible)
mysql -e "LOAD DATA LOCAL INFILE 'inbox/data.csv' INTO TABLE users FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 ROWS;"
```

## Key rules

1. **Default to read-only** — don't modify data unless explicitly asked
2. **Always LIMIT** large queries
3. **Export to outbox/** for delivery
4. **Use `\G` for vertical output** on wide tables
5. **Wrap writes in transactions** for safety
