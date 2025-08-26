// Lowercase social_links[].key for all user_profiles
// Usage: DB_URI='your-uri' node server/scripts/lowercase-social-keys.js

const mongoose = require('mongoose');

async function run() {
  const DB_URI = process.env.DB_URI;
  if (!DB_URI) {
    console.error('DB_URI environment variable is required.');
    process.exit(2);
  }

  await mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  const col = mongoose.connection.collection('user_profiles');

  console.log('Connected. Running updateMany to lowercase social_links keys...');

  const filter = { 'social_links.0': { $exists: true } };
  const pipeline = [
    {
      $set: {
        social_links: {
          $map: {
            input: '$social_links',
            as: 's',
            in: {
              key: { $toLower: '$$s.key' },
              value: '$$s.value'
            }
          }
        }
      }
    }
  ];

  try {
    // Use updateMany with aggregation pipeline (MongoDB >= 4.2)
    const result = await col.updateMany(filter, pipeline);
    console.log('Update result:', result);
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(3);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();
