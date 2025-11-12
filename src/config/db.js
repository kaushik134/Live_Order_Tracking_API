const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URI, {
            maxPoolSize: 20,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("Database Connected");
    } catch (err) {
        console.error("DB Connection Error:", err.message);
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB;
