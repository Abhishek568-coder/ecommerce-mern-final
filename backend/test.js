const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://abhi:Abhi7878@cluster0.rshzxli.mongodb.net/ecommerce?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("CONNECTED");
    process.exit(0);
  })
  .catch((err) => {
    console.log("ERROR:");
    console.log(err);
    process.exit(1);
  });