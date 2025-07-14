const RestaurantSettings = require("../models/restaurantSettings");

const setDefaultTimings = async (req, res) => {
    try {
        const { opening_time, closing_time } = req.body;

        if (!opening_time || !closing_time) {
            return res.status(400).json({ error: "Opening and closing times are required." });
        }

        const settings = await RestaurantSettings.findOne();

        if (settings) {
            await settings.update({ opening_time, closing_time });
            return res.json({ message: "Default timings updated successfully", settings });
        } else {
            const newSettings = await RestaurantSettings.create({ opening_time, closing_time });
            return res.json({ message: "Default timings set successfully", newSettings });
        }
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

// Get default restaurant settings
const getDefaultTimings = async (req, res) => {
    try {
        const settings = await RestaurantSettings.findOne();
        return res.json(settings);
    } catch (error) {
        return res.status(500).json({ error: "Server error" });
    }
};

module.exports = { setDefaultTimings, getDefaultTimings };