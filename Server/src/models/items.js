const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./category');

const Items = sequelize.define('Items', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,           
    },
    price:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false
    },
    category_id:{
        type: DataTypes.INTEGER
    },
    image:{
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM('available', 'unavailable'),          
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
    tableName: 'items'
});

Items.belongsTo(Category, { foreignKey: 'category_id', as: 'categoryId', onDelete: 'CASCADE' });

module.exports = Items;
