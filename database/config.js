const path = require('path');

/**
 * Database Configuration
 * MariaDB database setup and configuration
 */

const DB_CONFIG = {
    host: process.env.MARIADB_HOST || 'mariadb', // Use Docker service name
    user: process.env.MARIADB_USER || 'user',    // Match docker-compose.yml
    password: process.env.MARIADB_PASSWORD || 'userpassword', // Match docker-compose.yml
    database: process.env.MARIADB_DATABASE || 'users_db',  // Match docker-compose.yml
    port: process.env.MARIADB_PORT || 3306
};

module.exports = {
    DB_CONFIG
}; 