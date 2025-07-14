const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');

router.post('/unauth/create', customersController.createCustomer);
router.get('/unauth/all', customersController.getAllCustomers);
router.get('/:id', customersController.getCustomerById);
router.put('/update/:id', customersController.updateCustomer);
router.delete('/delete/:id', customersController.deleteCustomer);

module.exports = router;
