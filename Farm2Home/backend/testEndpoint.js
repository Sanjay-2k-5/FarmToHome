require('dotenv').config();

const test = async () => {
    try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGODB_URI);

        const Revenue = require('./src/models/Revenue');
        const pendingRevenue = await Revenue.find({ status: 'pending' })
            .populate('order', 'orderNumber total')
            .sort({ createdAt: -1 });

        console.log("Pending query result length:", pendingRevenue.length);
        console.log("First item populated order:", pendingRevenue[0]?.order);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};
test();
