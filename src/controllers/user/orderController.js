const { isValidObjectId } = require("mongoose");

const { validateWithJoi } = require("../../utils/validate");
const { createOrderSchema, getUserOrdersSchema, updateOrderStatusSchema } = require("../../utils/validations/orderValidation");
const orderModel = require("../../model/orderModel");
const productModel = require("../../model/productModel");
const { orderMsg } = require("../../utils/resMessage");
const { ORDER_STATUS } = require("../../common/constant");

const CACHE_EXPIRATION = process.env.CACHE_EXPIRATION || 3600;

exports.createOrder = async (req, res) => {
    try {
        const { isValid, value, errors } = validateWithJoi(req.body, createOrderSchema);
        if (!isValid) {
            return res.badRequest({
                message: errors.length > 1 ? "Multiple validation errors occurred." : "Validation error occurred.",
                data: errors,
            });
        }

        const { userId } = req.user;
        const { items, shippingAddress } = value;

        const productId = items.map(item => item.productId)
        if (productId.some(id => !isValidObjectId(id))) {
            return res.badRequest({
                message: "product IDs are invalid.",
            });
        }

        const products = await productModel.find({ _id: { $in: productId }, isActive: true });
        if (products.length !== productId.length) {
            return res.badRequest({
                message: "products are invalid or inactive.",
            });
        }

        for (const item of items) {
            const product = products.find((p) => p._id.toString() === item.productId);
            if (!product) {
                return res.badRequest({ message: `Product not found: ${item.productId}` });
            }

            if (product.stock < item.quantity) {
                return res.badRequest({
                    message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
                });
            }
        }

        const order = items.map(item => {
            const product = products.find(p => p._id.toString() === item.productId);
            return {
                productId: product._id,
                name: product.name,
                purchasePrice: product.price,
                quantity: item.quantity || 1
            }
        })

        const totalAmount = order.reduce((total, item) => total + (item.purchasePrice * item.quantity), 0);

        const newOrder = await new orderModel({
            userId,
            orderItems: order,
            totalAmount,
            shippingAddress,
        }).save();

        const updateStockPromises = items.map(item => {
            return productModel.updateOne(
                { _id: item.productId },
                { $inc: { stock: -item.quantity } }
            );
        });
        await Promise.all(updateStockPromises);

        const redis = req.app.get("redis");
        const cacheKey = `order:${newOrder._id}`;
        await redis.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(newOrder));
        await redis.del(`userOrders:${userId}`);

        return res.createResource({
            message: orderMsg.createSuccess,
            data: newOrder,
        });
    } catch (error) {
        console.error("Create Order Error:", error);
        return res.internalServerError({
            message: "An error occurred while creating the order. Please try again later.",
        });
    }
}

exports.getUserOrders = async (req, res) => {
    try {
        const redis = req.app.get("redis");
        const { userId } = req.user;
        const { isValid, value, errors } = validateWithJoi(req.query, getUserOrdersSchema);
        if (!isValid) {
            return res.badRequest({
                message: errors.length > 1 ? "Multiple validation errors occurred." : "Validation error occurred.",
                data: errors,
            });
        }

        const { page = 1, limit = 10 } = value;
        const cacheKey = `userOrders:${userId}`;
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
            return res.success({
                message: orderMsg.fetchCacheSuccess,
                data: JSON.parse(cachedData),
            });
        }

        const filter = { userId };
        if (value.status) filter.status = value.status

        const orders = await orderModel.find({ userId })
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });

        const totalOrders = await orderModel.countDocuments({ userId });

        const responseData = {
            orders,
            pagination: {
                total: totalOrders,
                page,
                limit,
                totalPages: Math.ceil(totalOrders / limit),
            }
        }
        await redis.setEx(cacheKey, CACHE_EXPIRATION, JSON.stringify(responseData));

        return res.success({
            message: orderMsg.fetchSuccess,
            data: responseData,
        });
    } catch (error) {
        console.error("Get User Orders Error:", error);
        return res.internalServerError({
            message: "An error occurred while fetching user orders. Please try again later.",
        });
    }
}

exports.updateOrderStatus = async (req, res) => {
    try {
        const redis = req.app.get("redis");
        const { id } = req.params;
        const { isValid, value, errors } = validateWithJoi(req.body, updateOrderStatusSchema);
        const { status } = value;

        if (!isValid) {
            return res.badRequest({
                message: errors.length > 1 ? "Multiple validation errors occurred." : "Validation error occurred.",
                data: errors,
            });
        }

        const order = await orderModel.findById(id);
        if (!order) {
            return res.notFound({ message: orderMsg.notFound });
        }

        const allowedTransitions = {
            [ORDER_STATUS.CREATED]: [ORDER_STATUS.dispatched, ORDER_STATUS.cancelled],
            [ORDER_STATUS.dispatched]: [ORDER_STATUS.delivered, ORDER_STATUS.cancelled],
            [ORDER_STATUS.delivered]: [],
            [ORDER_STATUS.cancelled]: [],
        };

        const currentStatus = order.status;

        if (currentStatus === status) {
            return res.badRequest({
                message: `Order is already in '${status}' status.`,
            });
        }

        const nextStates = allowedTransitions[currentStatus] || [];
        if (!nextStates.includes(status)) {
            return res.badRequest({
                message: `Cannot change order status from '${currentStatus}' to '${status}'.`,
            });
        }

        order.status = status;
        order.updatedAt = new Date();
        await order.save();

        await redis.del(`userOrders:${order.userId}`);

        const payload = {
            userId: order.userId.toString(),
            orderId: order._id.toString(),
            status: order.status,
            updatedAt: order.updatedAt,
        };

        const io = req.app.get("io");
        if (io) {
            io.to(payload.userId).emit("orderUpdated", payload);
        }

        return res.success({
            message: orderMsg.statusUpdateSuccess,
            data: order,
        });
    } catch (error) {
        console.error("Update Order Status Error:", error);
        return res.internalServerError({
            message: "An error occurred while updating order status. Please try again later.",
        });
    }
}