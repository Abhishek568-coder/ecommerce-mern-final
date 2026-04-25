const mongoose = require("mongoose");
const Cart = require("./models/Cart");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI);

const run = async () => {
  await Cart.deleteMany({});
  console.log("✅ All cart data deleted");

  process.exit();
};

run();