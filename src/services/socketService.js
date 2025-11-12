const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

let io = undefined;

const attachHandlers = () => {
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("Authentication token missing"));
            }
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.data.user = {
                userId: decoded.userId?.toString(),
                role: decoded.role,
            };
            return next();
        } catch (error) {
            return next(new Error("Invalid or expired token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.data.user?.userId;
        console.log("Socket connected:", socket.id, userId ? `user ${userId}` : "");

        socket.on("joinRoom", (requestedUserId) => {
            const roomId = (requestedUserId || userId)?.toString();
            if (!roomId) {
                socket.emit("error", { message: "userId is required to join room" });
                return;
            }
            socket.join(roomId);
            socket.emit("joinedRoom", roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket disconnected:", socket.id, reason);
        });
    });
};

const getSocket = (server) => {
    if (!io) {
        io = socketIo(server, { cors: { origin: "*" } });
        attachHandlers();
        console.log("Socket.IO initialized");
    }
    return io;
};

const sendDataToAll = (eventName, data) => {
    io?.sockets.emit(eventName, data);
};

const sendDataToRoom = (roomName, eventName, data) => {
    io?.in(roomName).emit(eventName, data);
};

module.exports = { getSocket, sendDataToAll, sendDataToRoom };
