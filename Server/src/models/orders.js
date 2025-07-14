// models/Order.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Customer = require("./customer");
const Table = require("./tables");
const User = require("./user");

const Orders = sequelize.define("Orders", {
    id: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: 
      { 
        model: Customer, 
        key: "id" 
      },
    },
    table_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: 
      { 
        model: Table, 
        key: "id" 
      },
    },
    waiter_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: 
      { 
        model: User, 
        key: "id" 
      },
    },
    status: {
      type: DataTypes.ENUM( "pending", "in_progress", "ready", "served", "cancelled" ),
      defaultValue: "pending",
    },
    order_type: {
      type: DataTypes.ENUM("dine_in", "takeaway"),
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    discount:{
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payment_type: {
        type: DataTypes.ENUM("cash", "card", "qr", "foc"),
        allowNull: true
    },
    transaction_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    proof: {
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
    tableName: 'orders'
});

Orders.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customerId', onDelete: 'CASCADE' });
Orders.belongsTo(Table, { foreignKey: 'table_id', as: 'tableId', onDelete: 'CASCADE' });
Orders.belongsTo(User, { foreignKey: 'waiter_id', as: 'waiterId', onDelete: 'CASCADE' });

module.exports = Orders;
