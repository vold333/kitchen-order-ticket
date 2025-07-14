const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Customers = sequelize.define('Customers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),      
        allowNull: false
    },
    phone: {
        type: DataTypes.STRING(15),
        allowNull: false
    },    
    is_deleted: {
        type: DataTypes.TINYINT(1),
        // type: DataTypes.SMALLINT(1),
        defaultValue: 0, 
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    tableName: 'customers'
});

module.exports = Customers;
