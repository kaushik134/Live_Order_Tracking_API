const joi = require("joi");

const emailSchema = joi
    .string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
        "string.email": "Enter a valid email.",
        "any.required": "Email is required.",
    });

const passwordSchema = joi
    .string()
    .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,50}$/,
        "strong password"
    )
    .required()
    .messages({
        "string.empty": "Password is required.",
        "string.pattern.name":
            "Password must be 6+ characters & include: uppercase, lowercase, number & special character.",
    });

exports.registerSchema = joi.object({
    userName: joi.string().min(3).max(30).required(),
    fullName: joi.string().min(3).required(),
    email: emailSchema,
    password: passwordSchema,
});

exports.loginSchema = joi.object({
    email: emailSchema,
    password: passwordSchema,
});
