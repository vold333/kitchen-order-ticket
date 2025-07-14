const express = require("express");
const multer = require('multer');
const path = require('path');
const orderController = require("../controllers/ordersController");
const authenticateToken = require('../middleware/authMiddleware');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/proof/');  // Save uploaded files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use the current timestamp as the filename
  }
});

// Initialize multer
const upload = multer({ storage: storage });

const router = express.Router();

router.post("/unauth/create", upload.single("proof"), orderController.createOrder);
router.post("/create", authenticateToken, upload.single("proof"), orderController.createOrder);

router.get("/all", authenticateToken, orderController.getAllOrders);

router.get("/unauth/:id", orderController.getOrderById);
router.get("/:id", authenticateToken, orderController.getOrderById);

router.put("/unauth/update/:id", upload.single("proof"), orderController.updateOrder);
router.put("/update/:id", authenticateToken, upload.single("proof"), orderController.updateOrder);

router.delete("/delete/:id", authenticateToken, orderController.deleteOrder); 

module.exports = router;