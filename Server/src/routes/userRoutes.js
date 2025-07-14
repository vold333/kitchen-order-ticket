
const express = require('express');
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authMiddleware');

// Set up multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save uploaded files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use the current timestamp as the filename
  }
});

// Initialize multer
const upload = multer({ storage: storage });

const router = express.Router();

// Login route (No authentication needed for login)
router.post('/login', userController.loginUser);

router.get('/waiters', userController.getWaiters);

// Protected routes (Token required for these)
router.get('/all', authenticateToken, userController.getUsers); 
router.get('/:id', authenticateToken, userController.getUser);  

// Create user with image upload (requires multer for profile_pic)
router.post('/create', upload.single('profile_pic'), userController.createUser);

// Update user (Admin only, no image upload needed here)
router.put('/update/:id', authenticateToken, userController.updateUser);

// Delete user (Admin only)
router.delete('/delete/:id', authenticateToken, userController.deleteUser);

module.exports = router;
