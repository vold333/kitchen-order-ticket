const express = require("express");
const router = express.Router();
const restaurantSettingsController = require("../controllers/restaurantSettingsController");
const authenticateToken = require('../middleware/authMiddleware');

router.post("/set", authenticateToken, restaurantSettingsController.setDefaultTimings);

router.get("/", authenticateToken, restaurantSettingsController.getDefaultTimings)

module.exports = router;
