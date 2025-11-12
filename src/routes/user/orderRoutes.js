const router = require("express").Router();

const { createOrder, getUserOrders, updateOrderStatus } = require("../../controllers/user/orderController");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.post("/", authMiddleware, createOrder)
router.get("/", authMiddleware, getUserOrders);
router.patch("/:id/status", authMiddleware, updateOrderStatus);

module.exports = router;
