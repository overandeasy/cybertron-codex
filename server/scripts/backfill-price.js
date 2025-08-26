// Run with: DB_URI=your_mongo_uri node server/scripts/backfill-price.js
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.error('DB_URI required');
    process.exit(1);
  }

  // Connect using modern options
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }).catch(err => {
    console.error('Failed to connect to DB:', err);
    process.exit(1);
  });
  console.log('Connected to DB');

  try {
    const collection = mongoose.connection.collection('user_collections');
    const res = await collection.updateMany(
      { $or: [ { price: { $exists: false } }, { price: null } ] },
      { $set: { price: 0.0, currency: 'USD' } }
    );
    console.log('Backfilled documents:', res.modifiedCount ?? res.result?.n ?? 0);
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

main();
