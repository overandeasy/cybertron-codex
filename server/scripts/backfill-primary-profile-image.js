// Backfill script: set primary_profile_image to the first image in images[] when missing
// Usage: DB_URI="mongodb+srv://.../cybertron_codex" node server/scripts/backfill-primary-profile-image.js

const mongoose = require('mongoose');

async function run() {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.error('DB_URI is required');
    process.exit(2);
  }
  await mongoose.connect(uri, { maxPoolSize: 5 });
  try {
    const collection = mongoose.connection.collection('user_profiles');
    const result = await collection.updateMany(
      { $or: [{ primary_profile_image: { $exists: false } }, { primary_profile_image: null }] },
      [
        {
          $set: {
            primary_profile_image: { $cond: [{ $gt: [{ $size: { $ifNull: ["$images", []] } }, 0] }, { $arrayElemAt: ["$images", 0] }, null] }
          }
        }
      ]
    );
    console.log('Matched:', result.matchedCount, 'Modified:', result.modifiedCount);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
