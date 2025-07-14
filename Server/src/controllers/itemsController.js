const Item = require('../models/items');
const Category = require('../models/category');
const path = require('path');

// Get all items
const getAllItems = async (req, res) => {
    try {
        const items = await Item.findAll({
            where: { is_deleted: 0 },
            include: [
                {
                    model: Category,
                    as: 'categoryId',
                    attributes: ['id', 'name'],
                    where: { is_deleted: 0 } // Ensure category is not deleted
                }
            ]
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error: error.message });
    }
};

// Get a single item by ID
const getItemById = async (req, res) => {
    try {
        const item = await Item.findOne({
            where: { id: req.params.id, is_deleted: 0 }, // Ensure item is not deleted
            include: [
                {
                    model: Category,
                    as: 'categoryId',
                    attributes: ['id', 'name'],
                    where: { is_deleted: 0 } // Ensure category is not deleted
                }
            ]
        });

        if (!item) return res.status(404).json({ message: "Item not found" });
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching item', error: error.message });
    }
};

// Create a new item
const createItem = async (req, res) => {
    try {
        const itemImage = req.file ? req.file.path : null;

        const { name, description, price, category_id, image, status } = req.body;
        const newItem = await Item.create({ name, description, price, category_id, image: itemImage, status });
        res.status(201).json("new item added successfully");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an item
const updateItem = async (req, res) => {
    try {
        const { name, description, price, category_id, status } = req.body;
        const item = await Item.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        let itemImage = item.image; // Retain existing image if no new image is uploaded
        if (req.file) {
            itemImage = req.file.path; // Update with new image
        }

        await item.update({ name, description, price, category_id, image: itemImage, status });
        res.json({ message: "Item updated successfully", item });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an item
const deleteItem = async (req, res) => {
    try {
        const item = await Item.findByPk(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        await item.update({ is_deleted: 1 });
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting items', error: error.message });
    }
};

module.exports = { createItem, getAllItems, getItemById, updateItem, deleteItem };