// Migration script: copy `collection_id` -> `collection_item_id` and remove `collection_id`.
// Usage: set DB_URI in the environment, then run `npm run migrate:collection-comments` from the server folder.

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
    // DB_URI is asserted to be a string above
    await mongoose.connect(DB_URI as string);
    const db = mongoose.connection;

    try {
        console.log('Connected. Preparing migration on collection: collection_comments');

        const collName = 'collection_comments';
        const coll = db.collection(collName);

        // Count documents that already have collection_item_id
        const haveNew = await coll.countDocuments({ collection_item_id: { $exists: true } });
        const haveOld = await coll.countDocuments({ collection_id: { $exists: true } });
        console.log(`Documents with collection_item_id: ${haveNew}`);
        console.log(`Documents with collection_id: ${haveOld}`);

        if (haveOld === 0) {
            console.log('No documents need migration. Exiting.');
            return;
        }

        // Perform updateMany using aggregation pipeline: set collection_item_id to value of collection_id, then unset collection_id
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
