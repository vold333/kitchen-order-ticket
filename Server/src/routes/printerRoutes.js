const express = require('express');
const { printKitchenReceipt, printPaymentBill } = require('../printer'); // Import printer function
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');

router.post('/kitchen', authenticateToken, async (req, res) => {
  try {
    const orderData = req.body; // Order details sent from frontend
    await printKitchenReceipt(orderData);
    res.json({ success: true, message: "Kitchen receipt printed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Printing failed", error });
  }
});

router.post('/payment-bill', authenticateToken, async (req, res) => {
  try {
    const orderData = req.body; // Order details sent from frontend
    await printPaymentBill(orderData);
    res.json({ success: true, message: "Payment bill printed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Printing failed", error });
  }
});

module.exports = router;
