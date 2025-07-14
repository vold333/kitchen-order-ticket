// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db'); 

// const Reservations = sequelize.define('Reservations', {
//     id: {
//         type: DataTypes.INTEGER,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     table_id: {
//         type: DataTypes.INTEGER,        
//         allowNull: true,
//         references: {
//             model: 'tables', 
//             key: 'id' 
//         },
//         onDelete: 'SET NULL'
//     },
//     customer_name: {
//         type: DataTypes.STRING(100),
//         allowNull: false,           
//     },
//     phone: {
//         type: DataTypes.STRING(15),
//         allowNull: false
//     },
//     status: {
//         type: DataTypes.ENUM('reserved', 'checked-in', 'completed', 'cancelled'),          
//         allowNull: false
//     }, 
//     is_deleted: {
//         type: DataTypes.TINYINT(1),
//         defaultValue: 0, 
//         allowNull: false
//     }
// }, {
//     timestamps: true,
//     createdAt: 'created_at',
//     updatedAt: 'updated_at',
//     tableName: 'reservations'
// });
// module.exports = Reservations;
