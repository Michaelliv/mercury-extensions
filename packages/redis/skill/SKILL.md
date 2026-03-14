---
name: redis
description: Inspect and manage Redis instances using redis-cli
---

# Redis (`redis-cli`)

## Connection

```bash
# Using REDIS_URL env var
redis-cli -u "$REDIS_URL" PING

# Explicit connection
redis-cli -h host -p 6379 -a password PING

# With TLS
redis-cli -h host -p 6380 --tls -a password PING
```

## Key operations

```bash
# Get/set
redis-cli GET mykey
redis-cli SET mykey "value"
redis-cli SET mykey "value" EX 3600  # with TTL

# Delete
redis-cli DEL mykey

# Check existence and type
redis-cli EXISTS mykey
redis-cli TYPE mykey
redis-cli TTL mykey

# Scan keys by pattern (safe alternative to KEYS)
redis-cli --scan --pattern "user:*"
redis-cli --scan --pattern "session:*" | head -20
```

## Data structures

```bash
# Hash
redis-cli HSET user:1 name "John" email "john@example.com"
redis-cli HGETALL user:1

# List
redis-cli LPUSH queue "task1"
redis-cli LRANGE queue 0 -1

# Set
redis-cli SADD tags "redis" "database"
redis-cli SMEMBERS tags

# Sorted set
redis-cli ZADD leaderboard 100 "alice" 200 "bob"
redis-cli ZRANGE leaderboard 0 -1 WITHSCORES
```

## Inspection

```bash
# Server info
redis-cli INFO server
redis-cli INFO memory
redis-cli INFO keyspace

# Database size
redis-cli DBSIZE

# Memory usage for a key
redis-cli MEMORY USAGE mykey

# Slow log
redis-cli SLOWLOG GET 10

# Connected clients
redis-cli CLIENT LIST
```

## Bulk export

```bash
# Dump all keys and values
redis-cli --scan --pattern "*" | while read key; do
  echo "$key: $(redis-cli GET "$key")"
done > outbox/redis-dump.txt

# CSV export of hash
redis-cli HGETALL user:1 | paste - - | tr '\t' ',' > outbox/user.csv
```

## Key rules

1. **Use SCAN, not KEYS** — KEYS blocks the server on large datasets
2. **Don't FLUSHDB/FLUSHALL** unless explicitly asked
3. **Be careful with MONITOR** — it captures all commands, use briefly
4. **Check TTL** before modifying keys — don't accidentally remove expiry
5. **Export to outbox/** for delivery
