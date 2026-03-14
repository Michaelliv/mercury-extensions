---
name: mongodb
description: Query and manage MongoDB databases using mongosh
---

# MongoDB (`mongosh`)

## Connection

```bash
# Using MONGODB_URI env var
mongosh "$MONGODB_URI" --eval "db.version()"

# Explicit connection
mongosh "mongodb://user:pass@host:27017/dbname"
```

## Queries

```bash
# Find documents
mongosh "$MONGODB_URI" --eval "db.users.find().limit(10).toArray()"

# Find with filter
mongosh "$MONGODB_URI" --eval "db.users.find({ status: 'active' }).limit(20).toArray()"

# Find with projection
mongosh "$MONGODB_URI" --eval "db.users.find({}, { name: 1, email: 1, _id: 0 }).limit(10).toArray()"

# Count
mongosh "$MONGODB_URI" --eval "db.users.countDocuments({ status: 'active' })"

# Aggregation
mongosh "$MONGODB_URI" --eval "db.orders.aggregate([
  { \$group: { _id: '\$status', count: { \$sum: 1 } } },
  { \$sort: { count: -1 } }
]).toArray()"
```

## Schema inspection

```bash
# List collections
mongosh "$MONGODB_URI" --eval "db.getCollectionNames()"

# Collection stats
mongosh "$MONGODB_URI" --eval "db.users.stats()"

# Indexes
mongosh "$MONGODB_URI" --eval "db.users.getIndexes()"

# Sample document shape
mongosh "$MONGODB_URI" --eval "db.users.findOne()"
```

## CRUD

```bash
# Insert
mongosh "$MONGODB_URI" --eval "db.users.insertOne({ name: 'John', email: 'john@example.com' })"

# Update
mongosh "$MONGODB_URI" --eval "db.users.updateOne({ _id: ObjectId('...') }, { \$set: { status: 'inactive' } })"

# Delete
mongosh "$MONGODB_URI" --eval "db.users.deleteOne({ _id: ObjectId('...') })"
```

## Export / Import

```bash
# Export collection to JSON
mongoexport --uri="$MONGODB_URI" --collection=users --out=outbox/users.json

# Export as CSV
mongoexport --uri="$MONGODB_URI" --collection=users --type=csv --fields=name,email --out=outbox/users.csv

# Import JSON
mongoimport --uri="$MONGODB_URI" --collection=users --file=inbox/users.json

# Import CSV
mongoimport --uri="$MONGODB_URI" --collection=users --type=csv --headerline --file=inbox/users.csv
```

## Query plans

```bash
mongosh "$MONGODB_URI" --eval "db.users.find({ email: 'test@example.com' }).explain('executionStats')"
```

## Key rules

1. **Default to read-only** — don't modify data unless explicitly asked
2. **Always `.limit()`** on find queries
3. **Use `--eval`** for non-interactive single queries
4. **Export to outbox/** — mongoexport results go to outbox/ for delivery
5. **Use `toArray()`** to get readable output from find/aggregate
