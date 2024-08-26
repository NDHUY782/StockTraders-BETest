const kafka = require("kafka-node");
const axios = require("axios");

const API_URL = "https://stocktraders.vn/service/data/getTotalTradeReal";
const API_KEY = "StockTraders"; // Thay thế nếu cần

const client = new kafka.KafkaClient({ kafkaHost: "kafka:9092" });
const producer = new kafka.Producer(client);

producer.on("ready", () => {
  console.log("Kafka producer is ready");
  setInterval(async () => {
    try {
      const response = await axios.post(API_URL, {
        TotalTradeRealRequest: {
          account: API_KEY,
        },
      });
      const message = JSON.stringify(response.data);
      producer.send(
        [{ topic: "stock-data", messages: [message] }],
        (err, data) => {
          if (err) {
            console.error("Error sending message:", err);
          } else {
            console.log("Message sent:", data);
          }
        }
      );
    } catch (error) {
      console.error("Error fetching data from API:", error);
    }
  }, 10000); // Gửi dữ liệu mỗi 10 giây
});

producer.on("error", (err) => console.error("Kafka producer error:", err));
