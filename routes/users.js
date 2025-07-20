const express = require('express');
const router = express.Router();
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById,
    getUsersByCity,
    getUsersByGender,
    searchUsers,
    getStats
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
 * @desc    Get all users with optional filtering and pagination
 * @access  Public
 * @query   {limit, offset, city, gender, search}
 */
router.get('/', getAllUsers);

/**
 * @route   GET /users/search
 * @desc    Search users by name or email
 * @access  Public
 * @query   {q} - Search query
 */
router.get('/search', searchUsers);

/**
 * @route   GET /users/stats
 * @desc    Get database statistics
 * @access  Public
 */
router.get('/stats', getStats);

/**
 * @route   GET /users/city/:city
 * @desc    Get users by city
 * @access  Public
 * @param   {string} city - City name
 */
router.get('/city/:city', getUsersByCity);

/**
 * @route   GET /users/gender/:gender
 * @desc    Get users by gender
 * @access  Public
 * @param   {string} gender - Gender (male, female, other)
 */
router.get('/gender/:gender', getUsersByGender);

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