const router = require("express").Router();

router.use("/auth", require("./authentication"));
router.use("/user", require("./user"));

module.exports = router;
