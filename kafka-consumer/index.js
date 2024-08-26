// kafka-consumer/index.js
const kafka = require("kafka-node");
const mongoose = require("mongoose");

const client = new kafka.KafkaClient({ kafkaHost: "kafka:9092" });
const consumer = new kafka.Consumer(
  client,
  [{ topic: "stock-data", partition: 0 }],
  { autoCommit: true }
);

// Mongoose Schema
const stockSchema = new mongoose.Schema({
  codeID: String,
  codeName: String,
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

mongoose
  .connect("mongodb://mongodb:27017/stockdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

consumer.on("message", async (message) => {
  try {
    const data = JSON.parse(message.value);
    // Xử lý dữ liệu và lưu vào MongoDB
    for (const stock of data.stockTotalReals) {
      await Stock.updateOne(
        { codeID: data.codeID, codeName: data.codeName },
        { $push: { stockTotalReals: stock } },
        { upsert: true }
      );
    }
    console.log("Data processed and saved to MongoDB");
  } catch (error) {
    console.error("Error processing message:", error);
  }
});

consumer.on("error", (err) => console.error("Kafka consumer error:", err));
