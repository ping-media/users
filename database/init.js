const mysql = require('mysql2/promise');
const { DB_CONFIG } = require('./config');

/**
 * Database Initialization Script
 * Creates the MariaDB users table and indexes
 */

async function initializeDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection(DB_CONFIG);
        console.log('🔗 Connected to MariaDB');

        // Create users table
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                phone VARCHAR(50) NOT NULL,
                city VARCHAR(100) NOT NULL,
                gender ENUM('male', 'female', 'other') NOT NULL,
                age INT NOT NULL CHECK (age >= 0 AND age <= 150),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.execute(createTableSQL);
        console.log('✅ Users table created or already exists');

        // Create indexes
        const createIndexesSQL = [
            `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
            `CREATE INDEX IF NOT EXISTS idx_users_city ON users(city)`,
            `CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender)`,
            `CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)`
        ];
        for (const sql of createIndexesSQL) {
            // MariaDB does not support IF NOT EXISTS for indexes before 10.5, so ignore errors if index exists
            try {
                await connection.execute(sql);
            } catch (e) {
                if (!e.message.includes('Duplicate key name')) {
                    throw e;
                }
            }
        }
        console.log('✅ Indexes created or already exist');

        // No need for a trigger for updated_at, handled by ON UPDATE CURRENT_TIMESTAMP
        console.log('🚀 Ready to use MariaDB database');
    } catch (error) {
        console.error('❌ Error initializing MariaDB database:', error);
        process.exit(1);
    } finally {
        if (connection) await connection.end();
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase }; 