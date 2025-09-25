// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// require("dotenv").config();


// const app = express();
// app.use(cors());

// console.log("RETELL_API_KEY =", process.env.RETELL_API_KEY);

// // 🔒 API key check for security
// app.use((req, res, next) => {
//   const apiKey = req.headers["retell_api_key"];
//   if (apiKey !== process.env.RETELL_API_KEY) {
//     return res.status(403).json({ error: "Forbidden" });
//   }
//   next();
// });

// // Endpoint for Retell to call
// app.post("/getOrderStatus", async (req, res) => {
//   const { orderId, phoneNumber } = req.body;

//   try {
//     let apiUrl = "";

//     if (orderId) {
//       apiUrl = `https://mobileapi.yiji-app.com/api/Order/GetOrderDetailsByOrderId/${orderId}`;
//     } else if (phoneNumber) {
//       apiUrl = `https://mobileapi.yiji-app.com/api/Order/GetOrderDetailsByPhoneNumber/${phoneNumber}`;
//     } else {
//       return res.status(400).json({ error: "orderId or phoneNumber required" });
//     }

//     const response = await axios.get(apiUrl);

//     // Format response for Retell
//     const data = response.data;
//     res.json({
//       success: true,
//       status: data?.OrderStatus || "Unknown",
//       orderId: data?.OrderId,
//       restaurant: data?.RestaurantName,
//       estimatedDeliveryTime: data?.EstimatedDeliveryTime,
//       raw: data
//     });

//   } catch (error) {
//     console.error("API error:", error.message);
//     res.status(500).json({ success: false, error: "Failed to fetch order details" });
//   }
// });

// module.exports = app;

// // app.listen(3000, () => {
// //   console.log("✅ Middleware server running on port 3000");
// // });


const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const apiKey = req.headers['retell_api_key'];
  if (!apiKey || apiKey !== process.env.RETELL_API_KEY) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

app.post('/getOrderStatus', async (req, res) => {
  const args = req.body.args || req.body;
  const { orderId, phoneNumber } = args;

  if (!orderId && !phoneNumber) {
    return res.status(400).json({ error: "orderId or phoneNumber required" });
  }

  try {
    const apiUrl = orderId
      ? `https://mobileapi.yiji-app.com/api/Order/GetOrderDetailsByOrderId/${orderId}`
      : `https://mobileapi.yiji-app.com/api/Order/GetOrderDetailsByPhoneNumber/${phoneNumber}`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    res.json({
      success: true,
      status: data?.OrderStatus || "Unknown",
      orderId: data?.OrderId,
      restaurant: data?.RestaurantName,
      estimatedDeliveryTime: data?.EstimatedDeliveryTime,
      raw: data
    });
  } catch (error) {
    console.error("API error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch order details",
      error_message: error.message,
      error_data: error?.response?.data
    });
  }
});

// Remove app.listen() for Vercel
module.exports = app;
