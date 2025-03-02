const express = require("express");
const cors = require("cors");
require("dotenv").config();

const apiRouter = require("./routes/apiRouter");

const app = express();
const PORT = process.env.PORT || 6996;

// Middleware
app.use(cors({
  origin: '*', // Be more specific in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
}));
app.use(express.json()); // Parse JSON request body
app.use("/api", apiRouter); // Mount API router

// Start server
app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
