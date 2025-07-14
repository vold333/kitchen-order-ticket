const Tables = require('../models/tables');
const Customer = require('../models/customer');
const User = require('../models/user');
const Orders = require('../models/orders');
const path = require('path');

// Create Order
const createOrder = async (req, res) => {
    try {
        const { customer_id, table_id, waiter_id, status, order_type, total_amount, discount, payment_type, transaction_id } = req.body;

        let proof = req.file ? req.file.path : null;

        // Validation for Dine-In Orders
        if (order_type === "dine_in") {
            if (!waiter_id) {
                return res.status(400).json({ error: "Waiter ID is required for dine-in orders" });
            }

            // Validate that the waiter_id belongs to a user with role = "waiter"
            const waiter = await User.findOne({ where: { id: waiter_id, role: "waiter" } });
            if (!waiter) {
                return res.status(400).json({ error: "Invalid waiter ID or user is not a waiter" });
            }
        } 

        // Validation for Takeaway Orders
        if (order_type === "takeaway") {
            
            // if (waiter_id) {
            //     return res.status(400).json({ error: "Waiter ID should not be provided for takeaway orders" });
            // }

            if (!payment_type) {
                return res.status(400).json({ error: "Payment type is required for takeaway orders" });
            }

            if (payment_type === "qr") {
                if (!transaction_id || !proof) {
                    return res.status(400).json({ error: "Transaction ID and proof image are required for QR payments" });
                }
            } else {
                if (transaction_id || proof) {
                    return res.status(400).json({ error: "Transaction ID and proof image should only be provided for QR payments" });
                }
            }
        }

        const order = await Orders.create({ 
            customer_id, table_id, waiter_id, status, order_type, total_amount, discount,
            payment_type, transaction_id, proof
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get All Orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Orders.findAll({
            include: [
                { model: Customer, as: "customerId" },
                { model: Tables, as: "tableId" },
                { model: User, as: "waiterId" }
            ]
        });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Order by ID
const getOrderById = async (req, res) => {
    try {
        const order = await Orders.findByPk(req.params.id, {
            include: [
                { model: Customer, as: "customerId" },
                { model: Tables, as: "tableId" },
                { model: User, as: "waiterId" }
            ]
        });
        if (!order) return res.status(404).json({ error: "Order not found" });

        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Order
// const updateOrder = async (req, res) => {
//     try {
//         const { waiter_id } = req.body;

//         if (waiter_id) {
//             const waiter = await User.findOne({ where: { id: waiter_id, role: "waiter" } });
//             if (!waiter) {
//                 return res.status(400).json({ error: "Invalid waiter ID or user is not a waiter" });
//             }
//         }

//         const [updated] = await Orders.update(req.body, { where: { id: req.params.id } });
//         if (!updated) return res.status(404).json({ error: "Order not found" });

//         res.status(200).json({ message: "Order updated successfully" });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

const updateOrder = async (req, res) => {
    try {
        const { waiter_id, payment_type, transaction_id } = req.body;
        const orderId = req.params.id;

        console.log("Updating order with ID:", orderId); // Debugging

        // Check if order exists before updating
        const order = await Orders.findOne({ where: { id: orderId } });
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Validate waiter_id if provided
        if (waiter_id) {
            const waiter = await User.findOne({ where: { id: waiter_id, role: "waiter" } });
            if (!waiter) {
                return res.status(400).json({ error: "Invalid waiter ID or user is not a waiter" });
            }
        }

        // Check if proof image was uploaded
        let proof = req.file ? req.file.path : order.proof; // Keep existing proof if not updated

        // Validate required fields if payment_type is "qr"
        if (payment_type === "qr") {
            if (!transaction_id || !proof) {
                return res.status(400).json({ error: "Transaction ID and proof are required for QR payment" });
            }
        }

        // Construct update object
        const updatedData = {
            ...req.body,
            proof, // Add proof if available
        };

        // Perform update
        const [updated] = await Orders.update(updatedData, { where: { id: orderId } });

        if (updated === 0) {
            return res.status(400).json({ error: "Order exists but no changes were made" });
        }

        res.status(200).json({ message: "Order updated successfully" });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ error: error.message });
    }
};

// Delete Order (Soft Delete)
const deleteOrder = async (req, res) => {
    try {
        const order = await Orders.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: "Order not found" });

        await order.update({ is_deleted: 1 });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrder, getAllOrders, getOrderById, updateOrder, deleteOrder };