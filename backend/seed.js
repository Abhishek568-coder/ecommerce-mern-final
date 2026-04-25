const mongoose = require("mongoose");
const Product = require("./models/Product");
require("dotenv").config();

// CONNECT DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// FULL PRODUCTS DATA (WITH DESCRIPTION ✅)
const products = [

  // 🏊 SWIMMING
  { name: "Swimming Goggles Pro", price: 500, description: "High quality swimming goggles", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqnm7x3fXfun3fqwUEe8UUeYH3y9Ff8C8wrA&s", category: "swimming" },
  { name: "Swim Cap Silicone", price: 200, description: "Comfortable swim cap", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcSmFJyZbc_BZP2abIPJ0QNnc_kWQNDZe3BhlMAVrJh_dinooQNplDE7PFjKDfquQovl8mvccoMYLVMD23kriPYXDLkbe9XabBU5MVDA9nw", category: "swimming" },
  { name: "Swimming Shorts", price: 700, description: "Quick dry swim shorts", image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQ915QjvdwGoBp2wu1qlbTGyHZ4ivVj1v9gDPxWgSCd9pZ2VMLQ6-h-F0i6excJXcKGg6cTopMt10Bd0pcd16q1b4flRO8U7GeRf0d0AyyzQzrmhWWzEOnS2w", category: "swimming" },
  { name: "Swimming Kickboard", price: 900, description: "Training kickboard", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTakwTDgfsHpMRZjBjfQLMIDDnDHqVHFUfrN5nSKPE7RbVUJJxKtAXV4tSl0QLxSdS5YYlTBVVNct3YB-ze3O5WUfwvSYSm46UH_EfrbtnH-hIU1jlkBLyT7l0", category: "swimming" },
  { name: "Swimming Fins", price: 1200, description: "Speed training fins", image: "https://m.media-amazon.com/images/I/71iiam+rBqL.jpg", category: "swimming" },

  // 🏋️ GYM
  { name: "Adjustable Dumbbells", price: 2000, description: "Heavy duty dumbbells", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlfzg8Ey1o4l8k4FPI6QscjknBWjh3DQmfYg&s", category: "Gym" },
  { name: "Yoga Mat Premium", price: 800, description: "Non-slip yoga mat", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz1wYSSOZ-ps7GQyx9kbNFpWSA97uxm18d7g&s", category: "gym" },
  { name: "Resistance Bands Set", price: 600, description: "Stretchable workout bands", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSHDVSQ7RbrMvi3m4vhxTraIjNCv7iVJLU_A&s", category: "gym" },
  { name: "Kettlebell 10kg", price: 1500, description: "Durable kettlebell", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIHiySJjMJyvAYs0mVj2ET_8Bl8YDrdTyQTQ&s", category: "gym" },
  { name: "Gym Gloves", price: 300, description: "Grip gym gloves", image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcSqkoA7MwEwWccOy_uqetSCTLIxJoMqBZ4lFNU5G0WDu8EuH65PEny9mMTYkCSw1dIz7AKOR6cf0Sc4-wwZL92QA-afATsN", category: "gym" },

  // 🚴 CYCLING
  { name: "Cycle Helmet Pro", price: 1200, description: "Protective helmet", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSYbV88ULYanEHo2ndij3dWTzldcdwR978k1w&s", category: "cycling" },
  { name: "Cycling Gloves", price: 400, description: "Comfort cycling gloves", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTM2kwK2z32Eg25KLqAa4bz4qNR78fAYom4dg&s", category: "cycling" },
  { name: "Water Bottle Holder", price: 250, description: "Cycle bottle holder", image: "https://m.media-amazon.com/images/I/61Bs5p2CALL.jpg", category: "cycling" },
  { name: "Cycle Light Set", price: 600, description: "Front & rear lights", image: "https://image-cdn.ubuy.com/bike-light-set-speedometer-led-bike/400_400_100/681b76434e1e1d1d4706c1f7.jpg", category: "cycling" },
  { name: "Cycling Jersey", price: 1000, description: "Breathable jersey", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwGzgqzg7p5gesxNamer4ShUNGAiU37P7E3A&s", category: "cycling" },

  // 🥾 HIKING
  { name: "Hiking Backpack 40L", price: 2500, description: "Large hiking backpack", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcTd6aXnmZczgcz-t7D96YMpAnGjxakXB-qqZxjaM7LdalZ9mJSXPoRULE4UuPyR2lfedMwzJq9BJQQHItWlYuIsG3E_mpVJU5eB6dHkB5s-vTPTPAnJudnIs7Ok5pxH_Ao6LideuDranQ&usqp=CAc", category: "hiking" },
  { name: "Camping Tent", price: 4000, description: "2 person tent", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFzFbCbinY1vVITt_1jYVNtjHPSt-CgRDxJA&s", category: "hiking" },
  { name: "Sleeping Bag", price: 1800, description: "Warm sleeping bag", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoTjCy7hRIQOLILVAhvVjFaNEaA2IHc3JXoA&s", category: "hiking" },
  { name: "Hiking Boots", price: 3500, description: "Strong grip boots", image: "https://m.media-amazon.com/images/I/41lkFguz18L._AC_SR290,290_.jpg", category: "hiking" },
  { name: "Trekking Poles", price: 1200, description: "Support trekking poles", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7nhqrj1HFc1fN_5T3qb6DzoeGGy5O1AyJLQ&s", category: "hiking" },

  // 👕 ACTIVEWEAR
  { name: "Sports T-Shirt Dry Fit", price: 700, description: "Sweat absorbing t-shirt", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRU_szJ9T2ZlVnVcn2t0t97iJF9KwUq3bEWg&s", category: "activewear" },
  { name: "Track Pants", price: 900, description: "Comfort track pants", image: "https://assets.ajio.com/medias/sys_master/root/20240806/VsCX/66b227a91d763220fa62cbe8/-1117Wx1400H-441139592-jetblack-MODEL.jpg", category: "activewear" },
  { name: "Compression Shorts", price: 500, description: "Flexible shorts", image: "https://contents.mediadecathlon.com/p2480341/bba35f387da6b9cd9450cbcc0d46db4d/p2480341.jpg", category: "activewear" },
  { name: "Gym Tank Top", price: 600, description: "Lightweight tank top", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7Y5qgDJuWP1K2gv0DgLQqjE8chTh4Q4-DCg&s", category: "activewear" },
  { name: "Sports Hoodie", price: 1200, description: "Warm hoodie", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKne9ZD-nJtp5ZBeFR92cF0j6h0GMudns4NA&s", category: "activewear" },

  // 👟 SHOES
  { name: "Running Shoes Pro", price: 3000, description: "High performance shoes", image: "https://m.media-amazon.com/images/I/61dOIibn+1L._AC_UY1000_.jpg", category: "shoes" },
  { name: "Training Shoes", price: 2500, description: "Multi-purpose training shoes", image: "https://assets.myntassets.com/w_200,q_50,,dpr_3,fl_progressive,f_webp/assets/images/2026/APRIL/16/WAEtM2Vl_24a3e748b21b42359e263c716be3107a.jpg", category: "shoes" },
  { name: "Football Boots", price: 2800, description: "Grip football boots", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9hGBLKELBILDVyumBKhTjslfCtaRSI_dnZw&s", category: "shoes" },
  { name: "Casual Sneakers", price: 2000, description: "Daily wear sneakers", image: "https://admin.mochishoes.com/product/71-253/660/71-253LA20.jpg", category: "shoes" },
  { name: "Trail Running Shoes", price: 3200, description: "Outdoor running shoes", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTwOzsS5LlFlTALPc-F57ccgjPFYjlos9jJPQ&s", category: "shoes" },

  // 🎒 BAGS
  { name: "Gym Bag Large", price: 1200, description: "Spacious gym bag", image: "https://images-static.nykaa.com/media/catalog/product/e/7/e7114fbNUT8681-01_1.jpg?tr=w-500", category: "bags" },
  { name: "Sports Backpack", price: 1500, description: "Durable backpack", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS4fv0o-ruUb32bhbvHlR2qznw6izdXMVy4w&s", category: "bags" },
  { name: "Travel Duffel Bag", price: 2000, description: "Travel duffel bag", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLJT6-mlNsZBmJonuqMFA4XgDxMKFb0qb0eQ&s", category: "bags" },
  { name: "Laptop Sports Bag", price: 1800, description: "Laptop carry bag", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQoXMk-e4bQxkGye05tGMe_UbcbnDkYgVzZNg&s", category: "bags" },
  { name: "Mini Gym Bag", price: 900, description: "Compact gym bag", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzwrjH7VwlOUbD7cHurdBeqUSlPeRI1ACl8Q&s", category: "bags" },
];

// RUN SCRIPT
const run = async () => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log("✅ Products Inserted Successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

run();