const express = require('express');
const multer = require('multer');
const path = require('path');
const itemController = require('../controllers/itemsController');
const authenticateToken = require('../middleware/authMiddleware');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/items/');  // Save uploaded files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use the current timestamp as the filename
  }
});

// Initialize multer
const upload = multer({ storage: storage });

const router = express.Router();

router.get('/unauth/all', itemController.getAllItems);
router.get('/all', authenticateToken, itemController.getAllItems);

router.get('/:id', authenticateToken, itemController.getItemById);

router.post('/create', authenticateToken, upload.single('image'), itemController.createItem);

router.put('/update/:id', authenticateToken, upload.single('image'), itemController.updateItem);

router.delete('/delete/:id', authenticateToken, itemController.deleteItem);

module.exports = router;
