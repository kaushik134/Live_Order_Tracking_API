const joi = require("joi");
const { ORDER_STATUS } = require("../../common/constant");

exports.createOrderSchema = joi.object({
    items: joi.array().items(
        joi.object({
            productId: joi.string().required(),
            quantity: joi.number().min(1).required(),
        })
    ).min(1).required().messages({
        "array.min": "At least one order item is required.",
    }),
    shippingAddress: joi.string().min(10).required(),
})

exports.getUserOrdersSchema = joi.object({
    status: joi.string().valid(...Object.values(ORDER_STATUS)),
    page: joi.number().min(1).default(1),
    limit: joi.number().min(1).max(100).default(10),
});

exports.updateOrderStatusSchema = joi.object({
    status: joi
        .string()
        .valid(...Object.values(ORDER_STATUS))
        .required()
        .messages({
            "any.required": "Status is required.",
            "any.only": "Status must be one of: created, dispatched, delivered, cancelled.",
        }),
});