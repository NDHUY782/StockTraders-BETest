const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const app = express();
const PORT = 3003;

const server = http.createServer(app);
const io = socketIo(server);

// Swagger setup
const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Notification Service API",
      version: "1.0.0",
      description: "API for sending real-time notifications",
    },
  },
  apis: ["./index.js"],
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => console.log("Client disconnected"));
});

/**
 * @openapi
 * /api/notify:
 *   get:
 *     summary: Send a notification to clients
 *     responses:
 *       200:
 *         description: Notification sent
 */
app.get("/api/notify", (req, res) => {
  io.emit("notification", { message: "Real-time data update" });
  res.status(200).json({ message: "Notification sent" });
});

server.listen(PORT, () =>
  console.log(`Notification Service running on port ${PORT}`)
);
