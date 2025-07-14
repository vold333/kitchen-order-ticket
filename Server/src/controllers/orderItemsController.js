const express = require('express');
const router = express.Router();
const OrderItems = require('../models/orderItems');
const Orders = require('../models/orders');
const Items = require('../models/items');

// Create an Order Item
const createOrderItems = async (req, res) => {
    try {
        const items = req.body; // Expecting an array of items

        // Validate that the input is an array
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: "Invalid input. Expected a non-empty array of items." });
        }

        // Validate each item in the array
        const validItems = items.every(item => 
            item.order_id && item.item_id && item.quantity && item.price !== undefined
        );

        if (!validItems) {
            return res.status(400).json({ error: "Each item must include order_id, item_id, quantity, and price." });
        }

        // Bulk create the order items
        const newOrderItems = await OrderItems.bulkCreate(items);

        // Respond with the created items
        res.status(201).json(newOrderItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Order Items
const getAllOrderItems = async (req, res) => {
    try {
        const orderItems = await OrderItems.findAll({
            include: [
                { model: Orders, as: 'orderId' },
                { model: Items, as: 'itemId' }
            ]
        });
        res.status(200).json(orderItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Order Item by ID
const getOrderItemById = async (req, res) => {
    try {
        const orderItem = await OrderItems.findByPk(req.params.id, {
            include: [
                { model: Orders, as: 'orderId' },
                { model: Items, as: 'itemId' }
            ]
        });
        if (!orderItem) return res.status(404).json({ message: 'Order item not found' });
        res.status(200).json(orderItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Order Items by Order ID
const getOrderItemsByOrderId = async (req, res) => {
    try {
        const orderItems = await OrderItems.findAll({
            where: { order_id: req.params.order_id },
            include: [
                { model: Orders, as: 'orderId' },
                { model: Items, as: 'itemId' }
            ]
        });

        if (!orderItems.length) {
            return res.status(404).json({ message: 'No order items found for this order ID' });
        }

        res.status(200).json(orderItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an Order Item
const updateOrderItem = async (req, res) => {
    try {
        const { quantity, price, special_request } = req.body;
        const orderItem = await OrderItems.findByPk(req.params.id);
        if (!orderItem) return res.status(404).json({ message: 'Order item not found' });
        await orderItem.update({ quantity, price, special_request });
        res.status(200).json(orderItem);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete an Order Item (Soft Delete)
const deleteOrderItem = async (req, res) => {
    try {
        const orderItem = await OrderItems.findByPk(req.params.id);
        if (!orderItem) return res.status(404).json({ message: 'Order item not found' });
        await orderItem.update({ is_deleted: 1 });
        res.status(200).json({ message: 'Order item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrderItems, getAllOrderItems, getOrderItemById, getOrderItemsByOrderId, updateOrderItem, deleteOrderItem };