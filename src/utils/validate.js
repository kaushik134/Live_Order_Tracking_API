exports.validateWithJoi = (payload, schema) => {
    const { value, error } = schema.validate(payload, { abortEarly: false });

    if (!error) {
        return { isValid: true, value };
    }

    const formattedErrors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message.replace(/["]/g, ""),
    }));

    return {
        isValid: false,
        errors: formattedErrors,
    };
};
