// Archived copy of migration script: copy `collection_id` -> `collection_item_id` and remove `collection_id`.
// Ran on 2025-08-25. Kept for audit only; do not run without review.

// ...original script preserved for audit

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
    console.error('DB_URI must be set in environment to run migration.');
    process.exit(1);
}

async function run() {
    console.log('Connecting to', DB_URI);
    await mongoose.connect(DB_URI as string);
    const db = mongoose.connection;

    try {
        const collName = 'collection_comments';
        const coll = db.collection(collName);

        const haveNew = await coll.countDocuments({ collection_item_id: { $exists: true } });
        const haveOld = await coll.countDocuments({ collection_id: { $exists: true } });
        console.log(`Documents with collection_item_id: ${haveNew}`);
        console.log(`Documents with collection_id: ${haveOld}`);

        if (haveOld === 0) {
            console.log('No documents need migration. Exiting.');
            return;
        }

        const filter = { collection_item_id: { $exists: false }, collection_id: { $exists: true } };
        console.log('Running updateMany to set collection_item_id from collection_id and unset collection_id...');

        const result = await coll.updateMany(filter, [
            { $set: { collection_item_id: '$collection_id' } },
            { $unset: ['collection_id'] }
        ] as any);

        console.log('updateMany result:', result);

        const afterHaveNew = await coll.countDocuments({ collection_item_id: { $exists: true } });
        const afterHaveOld = await coll.countDocuments({ collection_id: { $exists: true } });
        console.log(`After migration - documents with collection_item_id: ${afterHaveNew}`);
        console.log(`After migration - documents with collection_id: ${afterHaveOld}`);

        console.log('Migration complete.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exitCode = 2;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

run().catch((e) => {
    console.error('Unhandled error in migration:', e);
    process.exit(1);
});
