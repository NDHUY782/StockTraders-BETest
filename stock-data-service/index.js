const express = require("express");
const axios = require("axios");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();
const PORT = 3001;

const API_URL = "https://stocktraders.vn/service/data/getTotalTradeReal";
const API_KEY = "StockTraders"; // Thay thế nếu cần

async function getRealtimeData() {
  try {
    const response = await axios.post(API_URL, {
      TotalTradeRealRequest: {
        account: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data from API:", error);
    throw error;
  }
}

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Stock Data Service API",
      version: "1.0.0",
      description: "API for fetching real-time stock data",
    },
  },
  apis: ["./index.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Endpoints
/**
 * @openapi
 * /api/realtime:
 *   get:
 *     summary: Fetch real-time stock data
 *     responses:
 *       200:
 *         description: Real-time stock data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 */
app.get("/api/realtime", async (req, res) => {
  try {
    const data = await getRealtimeData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch realtime data" });
  }
});

app.listen(PORT, () =>
  console.log(`Stock Data Service running on port ${PORT}`)
);
