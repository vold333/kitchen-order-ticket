const express = require('express');
const router = express.Router();
const cookingCommentsController = require('../controllers/cookingCommentsController');
const authenticateToken = require('../middleware/authMiddleware');

// Create a cooking comment
router.post('/add', authenticateToken, cookingCommentsController.createCookingComment);

// Get all cooking comments (optional filter by category)
router.get('/unauth/all', cookingCommentsController.getCookingComments);
router.get('/all', authenticateToken, cookingCommentsController.getCookingComments);

// Get a single cooking comment by ID
router.get('/:id', authenticateToken, cookingCommentsController.getCookingCommentById);

// Update a cooking comment
router.put('/:id', authenticateToken, cookingCommentsController.updateCookingComment);

// Soft delete a cooking comment
router.delete('/:id', authenticateToken, cookingCommentsController.deleteCookingComment);

module.exports = router;
