const mongoose = require("mongoose");
const Order = require("./models/Order");

require("dotenv").config();

async function clearOrders() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Order.deleteMany({});
    console.log("✅ All orders deleted");

    process.exit();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

clearOrders();