const CookingComments = require('../models/cookingComments');
const Category = require('../models/category');

// Create a new cooking comment
const createCookingComment = async (req, res) => {
    try {
        const { category_id, comments } = req.body;

        if (!category_id || !comments) {
            return res.status(400).json({ message: 'Category and comments are required' });
        }

        const newComment = await CookingComments.create({ category_id, comments });
        return res.status(201).json({ message: 'Cooking comment added successfully', data: newComment });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all cooking comments (optional filter by category)
const getCookingComments = async (req, res) => {
    try {
        const { category_id } = req.query;
        let filter = { is_deleted: 0 };

        if (category_id) {
            filter.category_id = category_id;
        }

        const comments = await CookingComments.findAll({
            where: filter,
            include: [{ model: Category, as: 'categoryId', attributes: ['id', 'name'] }]
        });

        return res.status(200).json({ data: comments });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get a single cooking comment by ID
const getCookingCommentById = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await CookingComments.findOne({
            where: { id, is_deleted: 0 },
            include: [{ model: Category, as: 'categoryId', attributes: ['id', 'name'] }]
        });

        if (!comment) {
            return res.status(404).json({ message: 'Cooking comment not found' });
        }

        return res.status(200).json({ data: comment });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a cooking comment
const updateCookingComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comments } = req.body;

        const comment = await CookingComments.findOne({ where: { id, is_deleted: 0 } });

        if (!comment) {
            return res.status(404).json({ message: 'Cooking comment not found' });
        }

        comment.comments = comments || comment.comments;
        await comment.save();

        return res.status(200).json({ message: 'Cooking comment updated successfully', data: comment });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Soft delete a cooking comment
const deleteCookingComment = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await CookingComments.findOne({ where: { id, is_deleted: 0 } });

        if (!comment) {
            return res.status(404).json({ message: 'Cooking comment not found' });
        }

        comment.is_deleted = 1;
        await comment.save();

        return res.status(200).json({ message: 'Cooking comment deleted successfully' });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getCookingComments, getCookingCommentById, createCookingComment, updateCookingComment, deleteCookingComment };