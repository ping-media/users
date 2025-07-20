const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
} = require('../controllers/userController');

/**
 * User Routes
 * Defines all CRUD endpoints for user operations
 */

/**
 * @route   POST /users
 * @desc    Create a new user
 * @access  Public
 * @body    {name, email, phone, city, gender, age}
 */
router.post('/', createUser);

/**
 * @route   GET /users
 * @desc    Get all users
 * @access  Public
 */
router.get('/', getAllUsers);

/**
 * @route   GET /users/:id
 * @desc    Get user by ID
 * @access  Public
 * @param   {string} id - User ID (UUID)
 */
router.get('/:id', getUserById);

/**
 * @route   POST /users/:id
 * @desc    Update user by ID
 * @access  Public
 * @param   {string} id - User ID (UUID)
 * @body    {name, email, phone, city, gender, age}
 */
router.post('/:id', updateUserById);

/**
 * @route   DELETE /users/:id
 * @desc    Delete user by ID
 * @access  Public
 * @param   {string} id - User ID (UUID)
 */
router.delete('/:id', deleteUserById);

module.exports = router; 