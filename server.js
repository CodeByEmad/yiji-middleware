const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();


const app = express();
app.use(cors());
app.use(express.json());


console.log("RETELL_API_KEY =", process.env.RETELL_API_KEY);

// 🔒 API key check for security
app.use((req, res, next) => {
  const apiKey = req.headers["retell_api_key"];
  if (apiKey !== process.env.RETELL_API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// Endpoint for Retell to call
app.post("/getOrderStatus", async (req, res) => {
  const orderId = req.body.orderId || req.body.args?.orderId;
  const phoneNumber = req.body.phoneNumber || req.body.args?.phoneNumber;

  try {
    let apiUrl = "";

    if (orderId) {
      apiUrl = `https://mobileapi.yiji-app.com/api/Order/GetOrderDetailsByOrderId/${orderId}`;
    } else if (phoneNumber) {
      apiUrl = `https://mobileapi.yiji-app.com/api/Order/GetOrderDetailsByPhoneNumber/${phoneNumber}`;
    } else {
      return res.status(400).json({ error: "orderId or phoneNumber required" });
    }

    const response = await axios.get(apiUrl);
    const data = response.data;

    // ✅ Map numeric status to words
    const statusMap = {
      0: "Initial",
      1: "Pending Payment",
      2: "Received",
      3: "Finding Driver",
      4: "Driver Accepted",
      5: "In Kitchen",
      6: "Manual",
      7: "Ready To Pickup",
      8: "In Delivery",
      9: "Delivered",
      10: "Closed",
      11: "Canceled",
      12: "Force Canceled",
      13: "Force Closed",
      14: "Not Valid",
      15: "Paid",
      16: "POS Accepted",
      17: "Pending POS Accepted",
      65: "Arrived"
    };

    const numericStatus = data?.OrderStatus;
    const readableStatus = statusMap[numericStatus] || "Unknown";

    res.json({
      success: true,
      // ✅ Return readable status under "orderStatus"
      orderStatus: readableStatus,
      orderId: data?.OrderId,
      restaurant: data?.RestaurantName,
      estimatedDeliveryTime: data?.EstimatedDeliveryTime,
      raw: data
    });

  } catch (error) {
    console.error("API error:", error.message);
    res.status(500).json({ success: false, error: "Failed to fetch order details" });
  }
});



// app.post("/getOrderStatus", async (req, res) => {
//   // Handle both flat { orderId } and nested { args: { orderId } }
//   const orderId = req.body.orderId || req.body.args?.orderId;
//   const phoneNumber = req.body.phoneNumber || req.body.args?.phoneNumber;

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

//     } catch (error) {
//   console.error("API error:", error.message, error.response?.data);
//   res.status(500).json({ success: false, error: error.message, details: error.response?.data || null });
// }

  // } catch (error) {
  //   console.error("API error:", error.message);
  //   res.status(500).json({ success: false, error: "Failed to fetch order details" });
  // }
// });

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Middleware server running locally on port ${PORT}`);
  });
}
