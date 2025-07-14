const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

const Tables = sequelize.define('Tables', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    table_number: {
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: false
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,           
    },
    status: {
        type: DataTypes.ENUM('available', 'reserved', 'occupied'),          
        allowNull: false
    },
    assigned_waiter: {
        type: DataTypes.INTEGER, 
        allowNull: true, 
        // references: {
        // model: 'users',
        // key: 'id'
        // },
        // onDelete: 'SET NULL' 
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
    tableName: 'tables'
});

Tables.belongsTo(User, { foreignKey: 'assigned_waiter', as: 'assignedWaiter', onDelete: 'CASCADE' });

module.exports = Tables;
