// const express = require("express");
// const axios = require("axios");
// const cors = require("cors");
// require("dotenv").config();


// const app = express();
// app.use(cors());
// app.use(express.json());


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

const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Log the loaded API key (for debugging only)
console.log("RETELL_API_KEY =", process.env.RETELL_API_KEY);

// Order status mapping based on your enum
const orderStatusMap = {
  0:  "Initial",
  1:  "PendingPayment",
  2:  "Received",
  3:  "FindingDriver",
  4:  "DriverAccept",
  5:  "Inkitchen",
  6:  "Manual",
  7:  "ReadyToPickup",
  8:  "Indelivery",
  9:  "Delivered",
  10: "Closed",
  11: "Canceled",
  12: "ForceCancel",
  13: "ForceClosed",
  14: "NotValid",
  15: "Paid",
  16: "POSAccepted",
  17: "PendingPOSAccepted",
  65: "Arrived"
};

// ✅ Secure API key middleware
app.use((req, res, next) => {
  const apiKey = req.headers["retell_api_key"];
  if (apiKey !== process.env.RETELL_API_KEY) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
});

// ✅ Main endpoint to fetch order status
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

    // 🧠 Debugging: log raw structure to verify field path
    console.log("✅ Full order data received");
    console.log(JSON.stringify(data, null, 2));

    // 🧩 Access correct property path
    const rawStatus = data?.order?.orderStatus;
    console.log("Extracted orderStatus =", rawStatus, "type:", typeof rawStatus);

    // 🧮 Ensure numeric key for mapping
    const statusCode = Number(rawStatus);
    const statusText = orderStatusMap.hasOwnProperty(statusCode)
      ? orderStatusMap[statusCode]
      : "Unknown";

    console.log("Resolved Status =", statusText);

    // ✅ Proper JSON response
    res.json({
      success: true,
      status: statusText,
      orderId: data?.order?.id,
      restaurant: data?.order?.restaurantName || data?.RestaurantName,
      estimatedDeliveryTime: data?.order?.estimatedDeliveryTime || data?.EstimatedDeliveryTime,
      raw: data
    });

  } catch (error) {
    console.error("❌ API error:", error.message);

    if (error.response) {
      console.error("Response Error:", error.response.status, error.response.data);
    } else if (error.request) {
      console.error("Request Error: No response received.");
    } else {
      console.error("Error Setting Up Request:", error.message);
    }

    res.status(500).json({ success: false, error: "Failed to fetch order details" });
  }
});

// ✅ Export for Vercel / local use
module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Middleware server running locally on port ${PORT}`);
  });
}
