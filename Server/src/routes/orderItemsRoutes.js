const express = require('express');
const router = express.Router();
const orderItemsController = require('../controllers/orderItemsController');
const authenticateToken = require('../middleware/authMiddleware');

// Define Routes
router.post('/unauth/create', orderItemsController.createOrderItems);
router.post('/create', authenticateToken, orderItemsController.createOrderItems);

router.get('/all', authenticateToken, orderItemsController.getAllOrderItems);

router.get('/:id', authenticateToken, orderItemsController.getOrderItemById);

router.get('/orders/:order_id', authenticateToken, orderItemsController.getOrderItemsByOrderId);

router.put('/unauth/update/:id', orderItemsController.updateOrderItem);
router.put('/update/:id', authenticateToken, orderItemsController.updateOrderItem);
 
router.delete('/delete/:id', authenticateToken, orderItemsController.deleteOrderItem);

module.exports = router;

