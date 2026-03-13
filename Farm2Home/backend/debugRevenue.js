require('dotenv').config();
const mongoose = require('mongoose');
const Revenue = require('./src/models/Revenue');

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const count = await Revenue.countDocuments();
        const processed = await Revenue.countDocuments({ status: 'processed' });
        const pending = await Revenue.countDocuments({ status: 'pending' });

        console.log(`Total Revenue Docs: ${count}`);
        console.log(`Processed: ${processed}, Pending: ${pending}`);

        const all = await Revenue.find();
        console.dir(all, { depth: null });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
check();
