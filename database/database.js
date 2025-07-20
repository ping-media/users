const sqlite3 = require('sqlite3').verbose();
const { DB_PATH, databaseOptions } = require('./config');

/**
 * Database Service Layer
 * Provides singleton database connection and utility functions
 */

class DatabaseService {
    constructor() {
        this.db = null;
    }

    /**
     * Get database instance (singleton pattern)
     * @returns {Promise<Database>} SQLite database instance
     */
    async getDatabase() {
        if (!this.db) {
            return new Promise((resolve, reject) => {
                this.db = new sqlite3.Database(DB_PATH, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        // Enable foreign keys
                        this.db.run('PRAGMA foreign_keys = ON');
                        // Set busy timeout
                        this.db.run('PRAGMA busy_timeout = 3000');
                        resolve(this.db);
                    }
                });
            });
        }
        return this.db;
    }

    /**
     * Close database connection
     */
    async closeDatabase() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.db = null;
                        resolve();
                    }
                });
            });
        }
    }

    /**
     * Execute a query with parameters
     * @param {string} sql - SQL query
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Query result
     */
    async query(sql, params = {}) {
        const db = await this.getDatabase();
        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    /**
     * Execute a single row query
     * @param {string} sql - SQL query
     * @param {Object} params - Query parameters
     * @returns {Promise<Object|null>} Single row result or null
     */
    async queryOne(sql, params = {}) {
        const db = await this.getDatabase();
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    /**
     * Execute an insert/update/delete query
     * @param {string} sql - SQL query
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Query result with lastID and changes
     */
    async execute(sql, params = {}) {
        const db = await this.getDatabase();
        return new Promise((resolve, reject) => {
            db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        lastID: this.lastID,
                        changes: this.changes
                    });
                }
            });
        });
    }

    /**
     * Get database statistics
     * @returns {Promise<Object>} Database statistics
     */
    async getStats() {
        const db = await this.getDatabase();
        
        const userCount = await this.queryOne('SELECT COUNT(*) as count FROM users');
        const pageCount = await this.queryOne('PRAGMA page_count');
        const pageSize = await this.queryOne('PRAGMA page_size');
        
        const dbSize = pageCount.page_count * pageSize.page_size;
        
        return {
            userCount: userCount.count,
            dbSize: dbSize,
            dbPath: DB_PATH
        };
    }
}

// Export singleton instance
module.exports = new DatabaseService(); 