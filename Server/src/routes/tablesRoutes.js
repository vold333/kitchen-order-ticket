const express = require('express');
const router = express.Router();
const tablesController = require('../controllers/tablesController');
const authenticateToken = require('../middleware/authMiddleware');

router.post('/create', authenticateToken, tablesController.createTable);

router.get('/all', authenticateToken, tablesController.getAllTables);

router.get('/:id', authenticateToken, tablesController.getTableById);

router.put('/update/:id', authenticateToken, tablesController.updateTable);

router.delete('/delete/:id', authenticateToken, tablesController.deleteTable);

module.exports = router;
