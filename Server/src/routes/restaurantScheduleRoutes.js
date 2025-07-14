const express = require("express");
const router = express.Router();
const restaurantScheduleController = require("../controllers/restaurantScheduleController");
const authenticateToken = require('../middleware/authMiddleware');

router.get("/today", authenticateToken, restaurantScheduleController.getTodaySchedule);

router.get("/all", authenticateToken, restaurantScheduleController.getAllSchedules);

router.post("/set", authenticateToken, restaurantScheduleController.setSchedule);

router.get("/can-take-orders", authenticateToken, restaurantScheduleController.canTakeOrders);

module.exports = router;
