const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Orders = require('./orders');
const Items = require('./items');

const orderItems = sequelize.define('orderItems', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    order_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false,           
    },
    quantity:{
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
        },
    },
    price:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    special_request: {
        type: DataTypes.TEXT,
        allowNull: true
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
    tableName: 'order_items'
});

orderItems.belongsTo(Orders, { foreignKey: 'order_id', as: 'orderId', onDelete: 'CASCADE' });
orderItems.belongsTo(Items, { foreignKey: 'item_id', as: 'itemId', onDelete: 'CASCADE' });

module.exports = orderItems;
