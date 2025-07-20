const sqlite3 = require('sqlite3').verbose();
const fs = require('fs').promises;
const path = require('path');
const { DB_PATH, databaseOptions } = require('./config');

/**
 * Database Initialization Script
 * Creates the SQLite database and users table
 */

async function initializeDatabase() {
    try {
        // Ensure data directory exists
        const dataDir = path.dirname(DB_PATH);
        await fs.mkdir(dataDir, { recursive: true });

        console.log('📁 Creating database directory...');
        console.log(`📍 Database path: ${DB_PATH}`);

        // Initialize database
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('❌ Error creating database:', err);
                throw err;
            }
        });

        // Create users table
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                phone TEXT NOT NULL,
                city TEXT NOT NULL,
                gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
                age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        await new Promise((resolve, reject) => {
            db.exec(createTableSQL, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Create indexes for better performance
        const createIndexesSQL = `
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_city ON users(city);
            CREATE INDEX IF NOT EXISTS idx_users_gender ON users(gender);
            CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
        `;

        await new Promise((resolve, reject) => {
            db.exec(createIndexesSQL, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Create trigger to update updated_at timestamp
        const createTriggerSQL = `
            CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
            AFTER UPDATE ON users
            BEGIN
                UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
            END;
        `;

        await new Promise((resolve, reject) => {
            db.exec(createTriggerSQL, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // Close database connection
        await new Promise((resolve, reject) => {
            db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        console.log('✅ Database initialized successfully!');
        console.log('📊 Users table created with indexes and triggers');
        console.log('🚀 Ready to use SQLite database');

    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase }; 