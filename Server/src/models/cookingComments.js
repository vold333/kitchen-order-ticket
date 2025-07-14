const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Category = require('./category');

const cookingComments = sequelize.define('cookingComments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    category_id:{
        type: DataTypes.INTEGER
    },  
    comments: {
        type: DataTypes.TEXT,
        allowNull: false,           
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
    tableName: 'cooking_comments'
});

cookingComments.belongsTo(Category, { foreignKey: 'category_id', as: 'categoryId', onDelete: 'CASCADE' });

module.exports = cookingComments;
