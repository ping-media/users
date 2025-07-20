const { v4: uuidv4 } = require('uuid');
const userRepository = require('../database/userRepository');

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

        // Check if email already exists
        const existingUser = await userRepository.getUserByEmail(userData.email.toLowerCase().trim());
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
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

        // Add user to database
        const createdUser = await userRepository.createUser(newUser);

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
 * Get all users with optional filtering and pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getAllUsers(req, res) {
    try {
        const { limit, offset, city, gender, search } = req.query;
        
        // Parse pagination parameters
        const options = {};
        if (limit) options.limit = parseInt(limit);
        if (offset) options.offset = parseInt(offset);
        if (city) options.city = city;
        if (gender) options.gender = gender;
        if (search) options.search = search;

        const users = await userRepository.getAllUsers(options);
        const totalCount = await userRepository.getUserCount({ city, gender });
        
        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully',
            data: users,
            pagination: {
                total: totalCount,
                limit: options.limit || null,
                offset: options.offset || 0,
                count: users.length
            }
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
        
        const user = await userRepository.getUserById(id);
        
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
        const existingUser = await userRepository.getUserById(id);
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

        // Check if email is being changed and if it already exists
        if (updateData.email && updateData.email.toLowerCase().trim() !== existingUser.email) {
            const emailExists = await userRepository.getUserByEmail(updateData.email.toLowerCase().trim());
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
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
        const updatedUser = await userRepository.updateUser(id, updatedUserData);

        if (!updatedUser) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update user'
            });
        }

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
        const existingUser = await userRepository.getUserById(id);
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete user
        const deleted = await userRepository.deleteUser(id);

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

/**
 * Get users by city
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUsersByCity(req, res) {
    try {
        const { city } = req.params;
        const users = await userRepository.getUsersByCity(city);
        
        res.status(200).json({
            success: true,
            message: `Users in ${city} retrieved successfully`,
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error('Error getting users by city:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Get users by gender
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getUsersByGender(req, res) {
    try {
        const { gender } = req.params;
        const users = await userRepository.getUsersByGender(gender);
        
        res.status(200).json({
            success: true,
            message: `Users with gender ${gender} retrieved successfully`,
            data: users,
            count: users.length
        });

    } catch (error) {
        console.error('Error getting users by gender:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Search users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function searchUsers(req, res) {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const users = await userRepository.searchUsers(q);
        
        res.status(200).json({
            success: true,
            message: 'Search completed successfully',
            data: users,
            count: users.length,
            query: q
        });

    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}

/**
 * Get database statistics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function getStats(req, res) {
    try {
        const stats = await userRepository.getStats();
        
        res.status(200).json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: stats
        });

    } catch (error) {
        console.error('Error getting stats:', error);
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
    deleteUserById,
    getUsersByCity,
    getUsersByGender,
    searchUsers,
    getStats
}; 