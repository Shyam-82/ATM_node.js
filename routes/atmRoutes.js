const express = require("express");
const router = express.Router();

const atmController = require("../controllers/atmController");

router.post("/deposit", atmController.deposit);

router.post("/withdraw", atmController.withdraw);

router.get("/history", atmController.history);

router.post("/transfer", atmController.transfer);

router.get("/logout", atmController.logout);

module.exports = router;                    