const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const RestaurantSchedule = sequelize.define("RestaurantSchedule", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true,
    },
    opening_time: {
        type: DataTypes.TIME,
        allowNull: true, // NULL if it's a holiday
    },
    closing_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    is_holiday: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: "restaurant_schedule",
    timestamps: false,
});

module.exports = RestaurantSchedule;
