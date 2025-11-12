const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const http = require("http");

require("dotenv").config();
const env = process.env;

const app = express();
const server = http.createServer(app);

const connectDB = require("./src/config/db");
const { errorLogger, accessLogger } = require("./src/config/morganConfig");
const responseHandler = require("./src/utils/responseHandler");
const errorHandler = require("./src/middleware/errorHandler");
const { serveSwagger, setupSwagger } = require("./src/config/swagger");
const routes = require("./src/routes");
const { getSocket } = require("./src/services/socketService");

const io = getSocket(server);
app.set("io", io);

connectDB();
app.set("redis", require("./src/utils/redisClient"));
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

app.use(
    cors({
        origin: env.ALLOW_ORIGIN,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        credentials: true,
    })
);

app.set("etag", "strong");
app.use(compression());

app.use(express.json({ limit: "5mb", strict: true }));
app.use(express.urlencoded({ extended: false, limit: "5mb" }));

app.use(errorLogger);
app.use(accessLogger);

app.use(responseHandler);

app.get("/health", (req, res) => {
    return res.success({
        message: "Server Running",
        data: {
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
            env: env.NODE_ENV,
        },
    });
});

app.use("/docs", serveSwagger, setupSwagger);
app.use("/api", routes);
app.use((req, res) => {
    return res.notFound({ message: "Route not found" });
});

app.use(errorHandler);

const PORT = env.PORT || 8000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (${env.NODE_ENV})`);
    console.log(`http://localhost:${PORT}`);
    console.log(`http://localhost:${PORT}/docs for API documentation`);
});

const shutdown = (signal) => () => {
    console.log(`${signal} received. Shutting down gracefully...`);
    server.close(() => {
        console.log("HTTP server closed");
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
};

process.on("SIGINT", shutdown("SIGINT"));
process.on("SIGTERM", shutdown("SIGTERM"));
