const responseCode = require("../utils/responseCode");

module.exports = (err, req, res, next) => {
    console.error("Error:", err);

    if (err instanceof SyntaxError && "body" in err) {
        return res.badRequest({
            message: "Invalid JSON format. Please check your request body.",
        });
    }

    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.badRequest({
            message: "Validation failed.",
            data: errors,
        });
    }

    if (err.code === 11000) {
        return res.conflict({
            message: "Duplicate entry detected.",
            data: err.keyValue,
        });
    }

    if (err.isJoi) {
        const formatted = err.details.map(d => ({
            path: d.path.join("."),
            message: d.message.replace(/['"]/g, ""),
        }));

        return res.badRequest({
            message: "Invalid input.",
            data: formatted,
        });
    }

    if (err instanceof Error) {
        return res.internalServerError({
            message: err.message,
        });
    }

    return res.status(responseCode.INTERNAL_SERVER_ERROR).json({
        status: "ERROR",
        message: "Internal Server Error",
        data: null,
        traceId: req.traceId,
    });
};
