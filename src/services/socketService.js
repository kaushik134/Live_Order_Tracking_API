const socketIo = require("socket.io");

let io = undefined;

const getSocket = (server) => {
    if (!io) {
        io = socketIo(server, { cors: { origin: "*" } });
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
