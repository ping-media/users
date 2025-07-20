const { v4: uuidv4 } = require('uuid');
const { 
    readUsers, 
    findUserById, 
    addUser, 
    updateUser, 
    deleteUser 
} = require('../helpers/fileUtils');

/**
 * User Controller
 * Handles all user-related business logic and validation
 */

/**
 * Validate user data for required fields
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with isValid and errors
 */
function validateUserData(userData) {
    const requiredFields = ['name', 'email', 'phone', 'city', 'gender', 'age'];
    const errors = [];

    // Check for required fields
    for (const field of requiredFields) {
        if (!userData[field] || userData[field].toString().trim() === '') {
            errors.push(`${field} is required`);
        }
    }

    // Validate email format
    if (userData.email && !isValidEmail(userData.email)) {
        errors.push('Invalid email format');
    }

    // Validate age is a positive number
    if (userData.age !== undefined) {
        const age = Number(userData.age);
        if (isNaN(age) || age < 0 || age > 150) {
            errors.push('Age must be a valid number between 0 and 150');
        }
    }

    // Validate gender
    if (userData.gender && !['male', 'female', 'other'].includes(userData.gender.toLowerCase())) {
        errors.push('Gender must be male, female, or other');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Simple email validation
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function createUser(req, res) {
    try {
        const userData = req.body;
        
        // Validate user data
        const validation = validateUserData(userData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Generate UUID for the user
        const newUser = {
            id: uuidv4(),
            name: userData.name.trim(),
            email: userData.email.toLowerCase().trim(),
            phone: userData.phone.trim(),
            city: userData.city.trim(),
            gender: userData.gender.toLowerCase(),
            age: Number(userData.age)
        };

        // Add user to file
        const createdUser = await addUser(newUser);

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: createdUser
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllUsers(req, res) {
    try {
        const users = await readUsers();
        
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Get user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        
        const user = await findUserById(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User retrieved successfully',
            data: user
        });

    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Update user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function updateUserById(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if user exists
        const existingUser = await findUserById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Validate update data
        const validation = validateUserData(updateData);
        if (!validation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Prepare updated user data
        const updatedUserData = {
            name: updateData.name.trim(),
            email: updateData.email.toLowerCase().trim(),
            phone: updateData.phone.trim(),
            city: updateData.city.trim(),
            gender: updateData.gender.toLowerCase(),
            age: Number(updateData.age)
        };

        // Update user
        const updatedUser = await updateUser(id, updatedUserData);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Delete user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function deleteUserById(req, res) {
    try {
        const { id } = req.params;

        // Check if user exists
        const existingUser = await findUserById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user
        const deleted = await deleteUser(id);

        if (deleted) {
            res.status(200).json({
                success: true,
                message: 'User deleted successfully'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to delete user'
            });
        }

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUserById,
    deleteUserById
}; 