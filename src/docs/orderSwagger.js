/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management APIs
 */

/**
 * @swagger
 * /api/user/orders:
 *   post:
 *     summary: Create a new order
 *     description: Allows authenticated users to place a new order. It locks current product prices and reduces stock accordingly.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: 69143905d22e5a81286685c2
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               shippingAddress:
 *                 type: string
 *                 example: "123 Kamrej Road, Surat, Gujarat - 394185"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order created successfully.
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 67340a55c918e2f53a6cf8e2
 *                     totalAmount:
 *                       type: number
 *                       example: 1500
 *                     status:
 *                       type: string
 *                       example: created
 *       400:
 *         description: Validation or stock error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Insufficient stock for iPhone 15. Available: 1, Requested: 2"
 *       401:
 *         description: Unauthorized access
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/user/orders:
 *   get:
 *     summary: Get all orders for the logged-in user
 *     description: |
 *       Fetches all orders belonging to the authenticated user.  
 *       Supports pagination and optional status filter.  
 *       Uses Redis caching for faster responses on repeated requests.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [created, dispatched, delivered, cancelled]
 *         description: Filter orders by status
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: SUCCESS
 *                 message:
 *                   type: string
 *                   example: Orders fetched successfully (from cache)
 *                 data:
 *                   type: object
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 6734a88d8ac1f3567b6e1a45
 *                           totalAmount:
 *                             type: number
 *                             example: 25999
 *                           status:
 *                             type: string
 *                             example: delivered
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-11-12T10:45:32.123Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-11-12T11:00:00.456Z
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 35
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         totalPages:
 *                           type: integer
 *                           example: 4
 *       400:
 *         description: Validation failed or bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error occurred.
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while fetching user orders. Please try again later.
 */

/**
 * @swagger
 * /api/user/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     description: Allows admin or system to update the status of an order. It clears cached data in Redis and notifies the user in real-time via Socket.IO.
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique ID of the order to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: delivered
 *                 enum: [pending, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order status updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 6743c9fc40e913a33f8f4c11
 *                     status:
 *                       type: string
 *                       example: delivered
 *                     updatedAt:
 *                       type: string
 *                       example: 2025-11-12T10:35:12.512Z
 *       400:
 *         description: Invalid input or validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error occurred.
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                         example: status
 *                       message:
 *                         type: string
 *                         example: Status is required
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Order not found
 *       500:
 *         description: Server error while updating order status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: An error occurred while updating order status. Please try again later.
 */
