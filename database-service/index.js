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
    // const data = response.data.TotalTradeRealReply;
    // // Xóa dữ liệu cũ và lưu dữ liệu mới vào MongoDB
    // await Stock.deleteMany({});
    // await Stock.insertMany(data);
    // console.log("Data fetched and saved to MongoDB");
    const data = response.data.TotalTradeRealReply;

    if (data && data.codeReply) {
      // Xóa dữ liệu cũ trước khi lưu dữ liệu mới
      await Stock.deleteMany({});

      // Lưu dữ liệu mới vào MongoDB
      const newStockReal = new Stock({
        codeReply: data.codeReply,
        stockTotalReals: data.stockTotalReals,
      });

      await newStockReal.save();

      console.log("Data fetched and saved to MongoDB");
    } else {
      console.log("No data to save.");
    }
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
  res.status(200).send({ msg: "data:", stocks });
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
  res.status(200).send({ msg: "data:", stock });
});

/**
 * @openapi
 * /api/stocks/{stockId}/stockTotalReals/{realsId}:
 *   put:
 *     summary: Update a stockTotalReals
 *     parameters:
 *       - name: stockId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stock
 *       - name: realsId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stockTotalReals entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               close:
 *                 type: number
 *                 description: Closing price
 *               date:
 *                 type: string
 *                 format: date-time
 *                 description: Date of the stock data
 *               high:
 *                 type: number
 *                 description: Highest price
 *               low:
 *                 type: number
 *                 description: Lowest price
 *               open:
 *                 type: number
 *                 description: Opening price
 *               ticker:
 *                 type: string
 *                 description: Stock ticker symbol
 *               vol:
 *                 type: number
 *                 description: Volume of stocks traded
 *     responses:
 *       200:
 *         description: StockTotalReals entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Stock or stockTotalReals entry not found
 *       500:
 *         description: Error updating stockTotalReals
 */
app.put("/api/stocks/:stockId/stockTotalReals/:realsId", async (req, res) => {
  const { stockId, realsId } = req.params;
  const updateData = req.body;

  try {
    const stock = await Stock.findOneAndUpdate(
      { _id: stockId, "stockTotalReals._id": realsId },
      {
        $set: {
          "stockTotalReals.$": updateData,
        },
      },
      { new: true }
    );

    if (!stock) {
      return res
        .status(404)
        .send({ message: "Stock or stockTotalReals not found" });
    }

    res.status(200).send({ msg: "data:", stock });
  } catch (error) {
    res.status(500).send({ message: "Error updating stockTotalReals", error });
  }
});
/**
 * @openapi
 * /api/stocks/{stockId}/stockTotalReals/{realsId}:
 *   delete:
 *     summary: Delete a stockTotalReals
 *     parameters:
 *       - name: stockId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stock
 *       - name: realsId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the stockTotalReals entry
 *     responses:
 *       200:
 *         description: StockTotalReals entry deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Stock or stockTotalReals entry not found
 *       500:
 *         description: Error deleting stockTotalReals
 */
app.delete(
  "/api/stocks/:stockId/stockTotalReals/:realsId",
  async (req, res) => {
    const { stockId, realsId } = req.params;

    try {
      const stock = await Stock.findByIdAndUpdate(
        stockId,
        {
          $pull: { stockTotalReals: { _id: realsId } },
        },
        { new: true }
      );

      if (!stock) {
        return res
          .status(404)
          .json({ message: "Stock or stockTotalReals not found" });
      }

      res.status(200).send({
        message: "StockTotalReals entry deleted successfully",
        stock,
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Error deleting stockTotalReals", error });
    }
  }
);

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
