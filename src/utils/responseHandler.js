const responseCode = require("./responseCode");

const responseHandler = (req, res, next) => {
    const sendResponse = (statusCode, message, data = null, type) => {
        if (type === "success") res.locals.successMessage = message;
        else res.locals.errorMessage = message;

        return res.status(statusCode).json({
            status: type.toUpperCase(),
            message,
            data,
        });
    };

    res.success = (data = {}) =>
        sendResponse(
            responseCode.SUCCESS,
            data.message || "Request processed successfully.",
            data.data ?? null,
            "success"
        );

    res.createResource = (data = {}) =>
        sendResponse(
            responseCode.CREATED,
            data.message || "Resource created successfully.",
            data.data ?? null,
            "success"
        );

    res.badRequest = (data = {}) =>
        sendResponse(
            responseCode.BAD_REQUEST,
            data.message || "Invalid request.",
            data.data ?? null,
            "error"
        );

    res.unauthorized = (data = {}) =>
        sendResponse(
            responseCode.UNAUTHORIZED,
            data.message || "Unauthorized access.",
            data.data ?? null,
            "error"
        );

    res.forbidden = (data = {}) =>
        sendResponse(
            responseCode.FORBIDDEN,
            data.message || "Access forbidden.",
            data.data ?? null,
            "error"
        );

    res.notFound = (data = {}) =>
        sendResponse(
            responseCode.NOT_FOUND,
            data.message || "Resource not found.",
            data.data ?? null,
            "error"
        );

    res.conflict = (data = {}) =>
        sendResponse(
            responseCode.CONFLICT,
            data.message || "Resource conflict.",
            data.data ?? null,
            "error"
        );

    res.tooManyRequests = (data = {}) =>
        sendResponse(
            responseCode.TOO_MANY_REQUESTS,
            data.message || "Too many requests.",
            data.data ?? null,
            "error"
        );

    res.tokenExpired = (data = {}) =>
        sendResponse(
            responseCode.TOKEN_EXPIRED,
            data.message || "Token expired.",
            data.data ?? null,
            "error"
        );

    res.badGateway = (data = {}) =>
        sendResponse(
            responseCode.BAD_GATEWAY,
            data.message || "Bad gateway.",
            data.data ?? null,
            "error"
        );

    res.internalServerError = (data = {}) =>
        sendResponse(
            responseCode.INTERNAL_SERVER_ERROR,
            data.message || "Internal server error.",
            null,
            "error"
        );

    next();
};

module.exports = responseHandler;
