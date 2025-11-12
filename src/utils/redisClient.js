const { createClient } = require("redis");

const client = createClient({
    url: process.env.REDIS_URL,
});

client.on("connect", () => console.log("Connected to Redis"));
client.on("ready", () => console.log("Redis client ready"));
client.on("error", (err) => console.error("Redis Client Error:", err.message));
client.on("end", () => console.log("Redis connection closed"));

const connectRedis = async () => {
    try {
        if (!client.isOpen) {
            await client.connect();
        }
    } catch (error) {
        console.error("Redis connection failed:", error.message);
        setTimeout(connectRedis, 5000);
    }
};

connectRedis();

module.exports = client;
