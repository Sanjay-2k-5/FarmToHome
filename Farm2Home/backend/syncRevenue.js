require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./src/models/Order');
const Revenue = require('./src/models/Revenue');

const sync = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const deliveredOrders = await Order.find({ status: 'delivered' });
    let created = 0;

    for (const order of deliveredOrders) {
      const existing = await Revenue.findOne({ order: order._id });
      if (!existing) {
        // Create as processed so it shows up in monthly stats immediately
        await Revenue.create({
          order: order._id,
          amount: order.total,
          date: order.deliveredAt || order.updatedAt || new Date(),
          status: 'processed'
        });
        created++;
      }
    }

    console.log(`Created ${created} missing Revenue records.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

sync();
