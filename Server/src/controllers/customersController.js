const Customers = require('../models/customer');

// Create a new customer
const createCustomer = async (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ message: "Name and phone are required" });
        }

        const newCustomer = await Customers.create({ name, phone });
        res.status(201).json({ message: "Customer created successfully", customer: newCustomer });
    } catch (error) {
        res.status(500).json({ message: "Error creating customer", error: error.message });
    }
};

// Get all customers (excluding deleted ones)
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customers.findAll({ where: { is_deleted: 0 } });
        res.status(200).json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customers", error: error.message });
    }
};

// Get a single customer by ID
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await Customers.findOne({ where: { id, is_deleted: 0 } });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.status(200).json(customer);
    } catch (error) {
        res.status(500).json({ message: "Error fetching customer", error: error.message });
    }
};

// Update customer details
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;

        const customer = await Customers.findByPk(id);
        if (!customer || customer.is_deleted) {
            return res.status(404).json({ message: "Customer not found" });
        }

        await customer.update({ name, phone });
        res.status(200).json({ message: "Customer updated successfully", customer });
    } catch (error) {
        res.status(500).json({ message: "Error updating customer", error: error.message });
    }
};

// Soft delete a customer
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customers.findByPk(id);
        if (!customer || customer.is_deleted) {
            return res.status(404).json({ message: "Customer not found" });
        }

        await customer.update({ is_deleted: 1 });
        res.status(200).json({ message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting customer", error: error.message });
    }
};

module.exports = { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer };