const express = require("express");
const mongoose = require("mongoose");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cron = require("node-cron");
const axios = require("axios"); // Import axios
const app = express();
const PORT = 3002;

const stockSchema = new mongoose.Schema({
  codeReply: [
    {
      codeID: String,
      codeName: String,
    },
  ],
  stockTotalReals: [
    {
      close: Number,
      date: Date,
      high: Number,
      low: Number,
      open: Number,
      ticker: String,
      vol: Number,
    },
  ],
});

const Stock = mongoose.model("Stock", stockSchema);

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Database Service API",
      version: "1.0.0",
      description: "API for managing stock data in the database",
    },
  },
  apis: ["./index.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(express.json());

// API Endpoints
// Hàm để lấy dữ liệu từ API bên ngoài và lưu vào MongoDB
const fetchAndSaveStockData = async () => {
  try {
    const response = await axios.post(
      "https://stocktraders.vn/service/data/getTotalTradeReal",
      {
        TotalTradeRealRequest: { account: "StockTraders" },
      }
    );

    console.log("API Response:", response.data);
    const data = response.data.TotalTradeRealReply;
    // Xóa dữ liệu cũ và lưu dữ liệu mới vào MongoDB
    await Stock.deleteMany({});
    await Stock.insertMany(data);
    console.log("Data fetched and saved to MongoDB");

    // if (data) {
    //   // Cập nhật hoặc chèn mới chứng khoán vào MongoDB
    //   await Stock.updateMany(
    //     { "codeReply.codeID": data.codeReply.codeID },
    //     { $set: data.codeReply },
    //     { upsert: true }
    //   );
    // }

    // if (data) {
    //   // Cập nhật hoặc chèn mới dữ liệu chứng khoán vào MongoDB
    //   await Stock.updateMany(
    //     {
    //       "codeReply.codeID": data.codeReply.codeID,
    //     },
    //     { $set: data.stockTotalReals },
    //     { upsert: true }
    //   );
    // }

    // console.log("Data fetched and saved to MongoDB");
  } catch (error) {
    console.error("Error fetching and saving data:", error);
  }
};

// Lập lịch công việc để lấy dữ liệu và lưu vào MongoDB mỗi phút
cron.schedule("* * * * *", async () => {
  console.log("Running fetchAndSaveStockData...");
  await fetchAndSaveStockData();
});
/**
 * @openapi
 * /api/stocks:
 *   get:
 *     summary: Get all stocks
 *     responses:
 *       200:
 *         description: List of all stocks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   codeID:
 *                     type: string
 *                   codeName:
 *                     type: string
 *                   stockTotalReals:
 *                     type: array
 *                     items:
 *                       type: object
 */
app.get("/api/stocks", async (req, res) => {
  const stocks = await Stock.find();
  res.json(stocks);
});

/**
 * @openapi
 * /api/stocks:
 *   post:
 *     summary: Create a new stock
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               codeID:
 *                 type: string
 *               codeName:
 *                 type: string
 *               stockTotalReals:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: Stock created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.post("/api/stocks", async (req, res) => {
  const stock = new Stock(req.body);
  await stock.save();
  res.status(201).json(stock);
});

/**
 * @openapi
 * /api/stocks/{id}:
 *   put:
 *     summary: Update a stock by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Stock updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.put("/api/stocks/:id", async (req, res) => {
  const stock = await Stock.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(stock);
});

/**
 * @openapi
 * /api/stocks/{id}:
 *   delete:
 *     summary: Delete a stock by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Stock deleted
 */
app.delete("/api/stocks/:id", async (req, res) => {
  await Stock.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

mongoose
  .connect(
    "mongodb+srv://fisave-admin:kRdp07zIoB4DbQqP@fisave-cluster.4wvppvv.mongodb.net/Server",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => console.log(`Database Service running on port ${PORT}`));
