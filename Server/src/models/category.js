const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Categories = sequelize.define('Categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100), 
        unique: true,       
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,           
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
    tableName: 'categories'
});

module.exports = Categories;
