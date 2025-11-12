const { io } = require("socket.io-client");
const jwt = require("jsonwebtoken");
const readline = require("readline");

const DEFAULT_SOCKET_URL = "http://localhost:8000";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question, defaultValue) =>
  new Promise((resolve) => {
    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    rl.question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue || "");
    });
  });

const resolveUserId = (token, fallback) => {
  if (fallback) return fallback;
  try {
    const decoded = jwt.decode(token);
    if (decoded?.userId) {
      console.log(`userId extracted from JWT: ${decoded.userId}`);
      return decoded.userId;
    }
  } catch (err) {
    console.warn("Unable to auto-detect userId from token:", err.message);
  }
  return undefined;
};

const main = async () => {
  try {
    const token =
      process.env.ACCESS_TOKEN ||
      (await ask("Enter JWT access token (ACCESS_TOKEN env var optional)"));

    if (!token) {
      console.error("Access token is required. Aborting.");
      process.exitCode = 1;
      return;
    }

    const socketUrl =
      process.env.SOCKET_URL ||
      (await ask("Socket server URL", DEFAULT_SOCKET_URL)) ||
      DEFAULT_SOCKET_URL;

    let userId = resolveUserId(token, process.env.USER_ID);
    if (!userId) {
      userId = await ask("User ID (required if token lacks userId claim)");
      if (!userId) {
        console.error("User ID is required. Aborting.");
        process.exitCode = 1;
        return;
      }
    }

    rl.close();

    const socket = io(socketUrl, {
      transports: ["websocket"],
      auth: { token },
    });

    socket.on("connect", () => {
      console.log(`Connected to ${socketUrl} via socket ${socket.id}`);
      socket.emit("joinRoom", userId);
      console.log(`Subscribed to order updates for user ${userId}`);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("orderUpdated", (payload) => {
      console.log("Order status update received:", payload);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server.");
    });
  } catch (error) {
    rl.close();
    console.error("Unexpected error:", error.message);
    process.exitCode = 1;
  }
};

main();

