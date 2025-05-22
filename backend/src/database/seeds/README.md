# Goal Tracker Test Data

This directory contains SQL scripts to populate the database with test data.

## Goals Test Data

The `goals-test-data.sql` script inserts a comprehensive set of test goals:

- 10 root-level goals (5 public, 5 private)
- 6 child-level goals (distributed among the first 3 root goals)
- 4 sub-child goals (grandchildren) to demonstrate the maximum allowed nesting depth

The data structure demonstrates:

1. Hierarchical nesting (root > child > sub-child)
2. Public and private goals
3. Ordered goals within the same level
4. Goals with different deadlines

### How to Run the SQL Script

You can run the script directly against your PostgreSQL database using:

```bash
psql -U postgres -d goaltracker -f src/database/seeds/goals-test-data.sql
```

Or using the PostgreSQL command line:

```
\i src/database/seeds/goals-test-data.sql
```

Alternatively, use the Node.js script:

```bash
npm run db:test-data
```

### Important Notes

1. The script uses a placeholder user ID. Replace `'4e0e1d7e-d101-49e1-afee-981d9afeb009'` with an actual user ID from your database.

2. All UUIDs in the script follow the standard UUID format (8-4-4-4-12 hexadecimal digits).

3. The script properly handles reserved keywords by using double quotes around column names like `"order"`, `"isPublic"`, `"ownerId"`, etc.

4. The dates are set in the future (2025) for demonstration purposes.

5. Uses the PostgreSQL `NOW()` function for createdAt and updatedAt timestamps.

## Modifying the Script

If you need to modify the test data:

1. Ensure all UUIDs follow the standard format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
2. Use double quotes for PostgreSQL column names that match reserved keywords
3. Maintain valid relationships (e.g., parentId refers to an existing goal id)
4. Remember that the application enforces a maximum nesting depth of 2 levels (root > child > sub-child)
