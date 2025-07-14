const sequelize = require('../config/db');
const User = require('./user');
const Tables = require('./tables');
const Categories = require('./category');
const Items = require('./items');
const Customers = require('./customer');
const Orders = require('./orders');
const orderItems = require('./orderItems');
const RestaurantSchedule = require('./restaurantSchedule');
const RestaurantSettings = require('./restaurantSettings');
const cookingComments = require('./cookingComments');

// Sync all models at once (creates tables in MySQL if they don’t exist)
sequelize.sync()
  .then(() => console.log('All models were synchronized successfully.'))
  .catch(err => console.log('Error syncing models:', err));

module.exports = { User, Tables, Categories, Items, Customers, Orders, orderItems, RestaurantSchedule, RestaurantSettings, cookingComments };
