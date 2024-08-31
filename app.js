const mongoose = require('mongoose');
const o = require('dotenv').config();

const Order = require('./model/order');
const Payment = require('./model/Payment');
const OrderV2 = require('./model/OrderV2');
const User = require('./model/user');
const Product = require('./model/Product');

const DATABASE_URL = process.env.DATABASE_URL || 'mongodb://localhost:27017/store';
const DEFAULT_ZONE = process.env.DEFAULT_ZONE || '66d24f4e5110159f72ed8719';
const ANONYMOUS_USER = process.env.ANONYMOUS_USER || '5e8d934d10b3808df9567bcb';

mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log(`Connected to Database ${DATABASE_URL} Successfully`)
    migrate()
        .then(r => console.log('Migration Ended Successfully'))
        .catch(err => console.error(err));
});

migrate = async () => {

    console.log('Starting Migration, Please ensure the requisite environment variables are set');
    console.log('Ensure the following environment variables are set:');
    console.log('DATABASE_URL');
    console.log('DEFAULT_ZONE');
    console.log('ANONYMOUS_USER');
    console.log('Your can set them in this file or edit your .env file accordingly');

    const orders = await Order.find()
        .lean();

    const products = await Product.find()
        .lean();

    if (orders && orders.length > 0) {
        for (const order of orders) {
            console.log(`Migrating Order: ${order._id}`);

            const orderV2 = new OrderV2();

            // Cart Items
            if (order.cart && order.cart.items) {
                for (const id in order.cart.items) {
                    const product = order.cart.items[id];
                    const found = product.bundles.find(bundle => bundle.qty > 0);

                    // Means all the bundles in the bundle have 0 Quantity, we used to erroneously
                    // save this in the previous data schema
                    if (!found) {
                        console.log(`Product ${id} has no bundles and will not be migrated`);
                        continue;
                    }

                    console.log(`Product ${id} has active bundles and will be migrated`);

                    // Make sure the Product is in the database;
                    const fp = products.find(p => p._id.equals(id));

                    if (fp) {
                        console.log(`Product ${id} found in the database`);
                    } else {
                        console.error(`Error Product ${id} not found in the database, migration terminating`);
                        return;
                    }

                    product.bundles.forEach((bundle) => {
                        if (bundle.qty > 0) {
                            const data = {
                                product: id,
                                bundle: bundle._id,
                                name: product.name,
                                quantity: bundle.qty,
                                unit: bundle.unit,
                                price: bundle.price,
                                total: bundle.subTotalPrice,
                            }

                            console.log(`Push Item for Product ${id}`);

                            orderV2.items.push(data);
                        }
                    });
                }
            }

            if (order.paymentId) {
                const payment = new Payment();
                payment.date = order.date;
                payment.amount = order.cart.totalPrice;
                payment.status = 'Paid';
                payment.paymentId = order.paymentId;
                payment.user = order.user;
                const p = await payment.save();

                console.log(`Creating Payment ${p._id} for Order ${order._id}`);

                orderV2.payment = p._id;
            }

            if (order.cart.delivery && order.cart.delivery > 0) {
                orderV2.delivery = DEFAULT_ZONE;
                orderV2.deliveryPrice = 1000;


                console.log(`Creating Default Delivery for Order ${order._id}`);

                if (order.user) {
                    const user = await User.findById(order.user).lean();

                    if (!user) {
                        console.error(`User ${order.user} not found`);
                        return;
                    }

                    orderV2.deliveryAddress = user.address;
                    orderV2.user = order.user;
                    console.log(`Creating Default Delivery for Order ${order._id}`);
                } else {
                    orderV2.deliveryAddress = 'No Address';
                    orderV2.user = ANONYMOUS_USER;
                    console.log(`Creating Default Delivery for Order ${order._id}`);
                }
            }

            orderV2.date = order.date;
            if (order.instruction) orderV2.instruction = order.instruction;

            if (order.cut === undefined) {
                orderV2.cut = false;
            } else {
                orderV2.cut = order.cut;
            }

            orderV2.fulfilled = order.fulfilled;
            orderV2.grandTotal = order.cart.totalPrice;
            orderV2.status = 'Paid';
            const o = await orderV2.save();
            console.log(`Created new Order ${o._id}`);
        }
    }
};
