const path = require('path');

/**
 * Database Configuration
 * SQLite database setup and configuration
 */

const DB_PATH = path.join(__dirname, '..', 'data', 'users.db');

module.exports = {
    DB_PATH,
    // Database configuration options
    databaseOptions: {
        verbose: process.env.NODE_ENV === 'development' ? console.log : null,
        fileMustExist: false
    }
}; 