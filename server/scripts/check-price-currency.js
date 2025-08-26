// Run with: DB_URI=your_mongo_uri node server/scripts/check-price-currency.js
const mongoose = require('mongoose');

async function main() {
  const uri = process.env.DB_URI;
  if (!uri) {
    console.error('DB_URI required');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    const collection = mongoose.connection.collection('user_collections');
    const total = await collection.countDocuments({});
    const missingPrice = await collection.countDocuments({ $or: [ { price: { $exists: false } }, { price: null } ] });
    const missingCurrency = await collection.countDocuments({ $or: [ { currency: { $exists: false } }, { currency: null }, { currency: '' } ] });
    console.log(JSON.stringify({ total, missingPrice, missingCurrency }));
  } catch (err) {
    console.error('Check failed', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
