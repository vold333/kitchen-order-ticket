const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RestaurantSettings = sequelize.define("RestaurantSettings", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    opening_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: "11:00:00", // Default 10 AM
    },
    closing_time: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: "23:30:00", // Default 11 PM
    },
}, {
    tableName: "restaurant_settings",
    timestamps: false,
});

module.exports = RestaurantSettings;
