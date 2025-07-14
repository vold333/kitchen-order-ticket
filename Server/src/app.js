const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const tableRoutes = require('./routes/tablesRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const itemRoutes = require('./routes/itemsRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const orderItemsRoutes = require('./routes/orderItemsRoutes');
const printerRoutes = require('./routes/printerRoutes');
const restaurantScheduleRoutes = require('./routes/restaurantScheduleRoutes');
const restaurantSettingsRoutes = require('./routes/restaurantSettingsRoutes');
const cookingCommentsRoutes = require('./routes/cookingCommentsRoutes');

const app = express();

app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (images) from the 'uploads' folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use("/uploads", express.static("uploads"));
app.use("/uploads/items", express.static("items"));
app.use("/uploads/proof", express.static("proof"));

app.use('/print', printerRoutes); // Register the printing route

// Routes
app.use('/users', userRoutes);
app.use('/tables', tableRoutes);
app.use('/category', categoryRoutes);
app.use('/items', itemRoutes);
app.use('/customer', customerRoutes);
app.use('/orders', orderRoutes);
app.use('/orderItems', orderItemsRoutes);
app.use('/res-schedule', restaurantScheduleRoutes);
app.use('/res-settings', restaurantSettingsRoutes);
app.use('/cook-comments', cookingCommentsRoutes);

// Error handling middleware (if no route matches)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

module.exports = app;
