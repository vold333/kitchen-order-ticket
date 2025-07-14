const RestaurantSchedule = require("../models/restaurantSchedule");
const RestaurantSettings = require("../models/restaurantSettings");

// Get all default restaurant schedules
const getAllSchedules = async (req, res) => {
    try {
        const settings = await RestaurantSchedule.findAll();
        return res.json(settings);
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

// Get today's restaurant schedule (or default settings)
const getTodaySchedule = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];

        // Check if today has special timings
        const specialSchedule = await RestaurantSchedule.findOne({ where: { date: today } });

        if (specialSchedule) {
            return res.json(specialSchedule);
        }

        // If no special schedule, use default settings
        const defaultSettings = await RestaurantSettings.findOne();
        return res.json(defaultSettings);
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

// Add or update restaurant schedule
const setSchedule = async (req, res) => {
    try {
        const { date, opening_time, closing_time, is_holiday } = req.body;

        if (!date) {
            return res.status(400).json({ error: "Date is required." });
        }

        // If it's a holiday, set times to NULL
        const scheduleData = {
            date,
            opening_time: is_holiday ? null : opening_time,
            closing_time: is_holiday ? null : closing_time,
            is_holiday,
        };

        const schedule = await RestaurantSchedule.findOne({ where: { date } });

        if (schedule) {
            await schedule.update(scheduleData);
            return res.json({ message: "Schedule updated successfully", schedule });
        } else {
            const newSchedule = await RestaurantSchedule.create(scheduleData);
            return res.json({ message: "Schedule added successfully", newSchedule });
        }
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

// Check if waiter can take orders
const canTakeOrders = async (req, res) => {
    try {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const currentTime = now.toTimeString().split(" ")[0];

        // Check if today has a special schedule
        let schedule = await RestaurantSchedule.findOne({ where: { date: today } });

        if (!schedule) {
            // Use default settings if no special schedule
            schedule = await RestaurantSettings.findOne();
        }

        if (!schedule || schedule.is_holiday) {
            return res.status(403).json({ message: "Restaurant is closed today." });
        }

        const openingTime = new Date(`${today}T${schedule.opening_time}`);
        const closingTime = new Date(`${today}T${schedule.closing_time}`);

        // Restrict orders before opening
        if (now < openingTime) {
            return res.status(403).json({ message: "Cannot take orders before the restaurant opens." });
        }

        
        // Restrict orders in the first 30 minutes after opening
        const orderStartTime = new Date(openingTime);
        orderStartTime.setMinutes(orderStartTime.getMinutes() + 30);
        if (now < orderStartTime) {
            return res.status(403).json({ message: "Orders can only be placed 30 minutes after opening." });
        }

        if (now > closingTime) {
            return res.status(403).json({ message: "Cannot take orders after the restaurant closed." });
        }

        // Restrict orders in the last 30 minutes before closing
        closingTime.setMinutes(closingTime.getMinutes() - 30);
        if (now >= closingTime) {
            return res.status(403).json({ message: "Cannot take orders in the last 30 minutes before closing." });
        }

        return res.json({ message: "Orders can be placed." });
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = { getAllSchedules, getTodaySchedule, setSchedule, canTakeOrders };