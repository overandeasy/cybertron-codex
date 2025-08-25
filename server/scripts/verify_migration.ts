// Verification script: print counts for collection_comments fields
// Usage: set DB_URI in environment, then run `npm run verify:migration` from the server folder.

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
const DB_URI = process.env.DB_URI;

if (!DB_URI) {
    console.error('DB_URI must be set in environment to run verification.');
    process.exit(1);
}

async function run() {
    console.log('Connecting to DB...');
    await mongoose.connect(DB_URI as string);
    const db = mongoose.connection;

    try {
        const coll = db.collection('collection_comments');
        const total = await coll.countDocuments({});
        const haveNew = await coll.countDocuments({ collection_item_id: { $exists: true } });
        const haveOld = await coll.countDocuments({ collection_id: { $exists: true } });

        console.log(`total documents: ${total}`);
        console.log(`with collection_item_id: ${haveNew}`);
        console.log(`with collection_id: ${haveOld}`);

        console.log('\nSample document (one with collection_item_id):');
        const sample = await coll.findOne({ collection_item_id: { $exists: true } }, { projection: { collection_item_id: 1, collection_id: 1, user_profile_id: 1, content: 1 } });
        console.log(sample);
    } catch (err) {
        console.error('Verification failed:', err);
        process.exitCode = 2;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
    }
}

run().catch((e) => {
    console.error('Unhandled error in verification:', e);
    process.exit(1);
});
