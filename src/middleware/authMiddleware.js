const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");
const { auth } = require("../utils/resMessage");


exports.authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.unauthorized({ message: auth.invalidToken });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.unauthorized({ message: auth.invalidToken });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        } catch (err) {
            return res.unauthorized({ message: auth.invalidToken });
        }

        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.unauthorized({ message: auth.notFound });
        }

        req.user = {
            userId: user._id,
            role: user.role,
        };

        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        return res.internalServerError({ message: resMessage.common.internalError });
    }
};