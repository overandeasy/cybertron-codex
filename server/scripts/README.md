Migration scripts

migrate_collection_comments.ts

- Purpose: copy existing `collection_id` field into `collection_item_id` for documents in `collection_comments`, then remove the old `collection_id` field.

Usage:

1. Backup your database before running any migration.
2. From the project root, set DB_URI in the environment and run from the server folder:

   cd server
   export DB_URI="<your mongo connection string>"
   npm run migrate:collection-comments

The script will report how many documents had old/new fields before and after migration.

Archived:
After successful migration on 2025-08-25 the active migration script was moved to `server/scripts/archived/` for audit.
