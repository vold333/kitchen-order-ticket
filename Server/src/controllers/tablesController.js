const Tables = require('../models/tables');
const User = require('../models/user');

// Create a new table
const createTable = async (req, res) => {
    try {
        const { table_number, capacity, status, assigned_waiter } = req.body;

        // Check if assigned_waiter exists and has role "waiter"
        if (assigned_waiter) {
            const waiter = await User.findOne({
                where: { id: assigned_waiter, role: 'waiter' }
            });

            if (!waiter) {
                return res.status(400).json({ message: 'Invalid waiter ID. Only users with role "waiter" can be assigned.' });
            }
        }

        // Create the table if the waiter check passes
        const newTable = await Tables.create({ table_number, capacity, status, assigned_waiter });

        res.status(201).json({ message: 'Table created successfully', data: newTable });

    } catch (error) {
        res.status(500).json({ message: 'Error creating table', error: error.message });
    }
};

// Get all tables
const getAllTables = async (req, res) => {
    try {
        const tables = await Tables.findAll({
            where: { is_deleted: 0 },
            include: [{ model: User, as: 'assignedWaiter', attributes: ['id', 'name', 'role'] }]
        });
        res.status(200).json(tables);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tables', error: error.message });
    }
};

// Get a single table by ID
const getTableById = async (req, res) => {
    try {
        const table = await Tables.findByPk(req.params.id, {
            include: [{ model: User, as: 'assignedWaiter', attributes: ['id', 'name', 'role'] }]
        });
        if (!table) return res.status(404).json({ message: 'Table not found' });
        res.status(200).json(table);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching table', error: error.message });
    }
};

// Update a table
const updateTable = async (req, res) => {
    try {
        const { table_number, capacity, status, assigned_waiter } = req.body;
        const table = await Tables.findByPk(req.params.id);
        if (!table) return res.status(404).json({ message: 'Table not found' });

        await table.update({ table_number, capacity, status, assigned_waiter });
        res.status(200).json({ message: 'Table updated successfully', data: table });
    } catch (error) {
        res.status(500).json({ message: 'Error updating table', error: error.message });
    }
};

// Soft delete a table
const deleteTable = async (req, res) => {
    try {
        const table = await Tables.findByPk(req.params.id);
        if (!table) return res.status(404).json({ message: 'Table not found' });

        await table.update({ is_deleted: 1 });
        res.status(200).json({ message: 'Table deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting table', error: error.message });
    }
};

module.exports = { createTable, getAllTables, getTableById, updateTable, deleteTable };