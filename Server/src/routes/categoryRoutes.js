const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authenticateToken = require('../middleware/authMiddleware');

router.get('/unauth/all', categoryController.getAllCategories);
router.get('/all', authenticateToken, categoryController.getAllCategories);

router.get('/:id', authenticateToken, categoryController.getCategoryById);

router.post('/create', authenticateToken, categoryController.createCategory);

router.put('/update/:id', authenticateToken, categoryController.updateCategory);

router.delete('/delete/:id', authenticateToken, categoryController.deleteCategory);

module.exports = router;
