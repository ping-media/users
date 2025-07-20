const fs = require('fs').promises;
const path = require('path');

/**
 * File utilities for JSON data persistence
 * Handles reading from and writing to data.json file
 */

const DATA_FILE_PATH = path.join(__dirname, '..', 'data', 'data.json');

/**
 * Read all users from the JSON file
 * @returns {Promise<Array>} Array of user objects
 */
async function readUsers() {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(DATA_FILE_PATH);
        await fs.mkdir(dataDir, { recursive: true });
        
        const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return [];
        }
        throw new Error(`Error reading users: ${error.message}`);
    }
}

/**
 * Write users array to the JSON file
 * @param {Array} users - Array of user objects to write
 * @returns {Promise<void>}
 */
async function writeUsers(users) {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(DATA_FILE_PATH);
        await fs.mkdir(dataDir, { recursive: true });
        
        await fs.writeFile(DATA_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        throw new Error(`Error writing users: ${error.message}`);
    }
}

/**
 * Find a user by ID
 * @param {string} id - User ID to find
 * @returns {Promise<Object|null>} User object or null if not found
 */
async function findUserById(id) {
    const users = await readUsers();
    return users.find(user => user.id === id) || null;
}

/**
 * Add a new user to the file
 * @param {Object} user - User object to add
 * @returns {Promise<Object>} The added user with generated ID
 */
async function addUser(user) {
    const users = await readUsers();
    users.push(user);
    await writeUsers(users);
    return user;
}

/**
 * Update an existing user in the file
 * @param {string} id - User ID to update
 * @param {Object} updatedUser - Updated user data
 * @returns {Promise<Object|null>} Updated user object or null if not found
 */
async function updateUser(id, updatedUser) {
    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
        return null;
    }
    
    users[userIndex] = { ...users[userIndex], ...updatedUser };
    await writeUsers(users);
    return users[userIndex];
}

/**
 * Delete a user from the file
 * @param {string} id - User ID to delete
 * @returns {Promise<boolean>} True if user was deleted, false if not found
 */
async function deleteUser(id) {
    const users = await readUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
        return false;
    }
    
    users.splice(userIndex, 1);
    await writeUsers(users);
    return true;
}

module.exports = {
    readUsers,
    writeUsers,
    findUserById,
    addUser,
    updateUser,
    deleteUser
}; 