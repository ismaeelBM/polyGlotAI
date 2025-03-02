const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

// Middleware to log requests (optional)
router.use((req, res, next) => {
  console.log(`[Proxy] ${req.method} ${req.originalUrl}`);
  next();
});

// Handle OPTIONS requests (preflight)
router.options("/calls", (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.status(200).send();
});

// Handle Ultravox API Calls
router.post("/calls", async (req, res) => {
  try {
    const apiUrl = `${process.env.ULTRAVOX_API_URL}/api/calls`;

    // Ensure the request body is forwarded correctly
    const response = await axios.post(apiUrl, req.body, {
      headers: {
        "X-API-Key": process.env.ULTRAVOX_API_KEY, // API Key from .env
        "Content-Type": "application/json",
      },
    });

    // Send response back to client
    res.status(response.status).json(response.data);
  } catch (error) {
    console.error("Error forwarding request:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: "Proxy request failed",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;
