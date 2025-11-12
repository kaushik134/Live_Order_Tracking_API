const jwt = require("jsonwebtoken");

const tokenModel = require("../model/tokenModel");

exports.generateToken = async (payload) => {
    const accessToken = await jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES || "1d"
    });

    const refreshToken = await jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
    });

    await tokenModel.findOneAndUpdate({
        userId: payload.userId,
    }, {
        accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    }, {
        upsert: true,
        new: true,
    })

    return { accessToken, refreshToken };
}