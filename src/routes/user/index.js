const router = require("express").Router();

router.use("/orders", require("./orderRoutes.js"));

module.exports = router;
