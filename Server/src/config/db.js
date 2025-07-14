require('dotenv').config();
const { Sequelize } = require('sequelize');

// Set up Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    // dialect: 'postgres',
    port: process.env.DB_PORT,
    timezone: process.env.DB_TIMEZONE,
  }
);

// Test connection to the database
sequelize.authenticate()
  .then(() => {
    console.log('Connection to MySQL has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
