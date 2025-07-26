const mysql = require('mysql2/promise');
const { DB_CONFIG } = require('./config');

/**
 * Database Service Layer
 * Provides singleton MariaDB connection pool and utility functions
 */

class DatabaseService {
    constructor() {
        this.pool = null;
    }

    /**
     * Get MariaDB connection pool (singleton pattern)
     * @returns {Promise<Pool>} MariaDB connection pool
     */
    async getPool() {
        if (!this.pool) {
            this.pool = mysql.createPool(DB_CONFIG);
        }
        return this.pool;
    }

    /**
     * Close database connection pool
     */
    async closeDatabase() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }

    /**
     * Execute a query with parameters
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Array>} Query result
     */
    async query(sql, params = []) {
        const pool = await this.getPool();
        const [rows] = await pool.execute(sql, params);
        return rows || [];
    }

    /**
     * Execute a single row query
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Object|null>} Single row result or null
     */
    async queryOne(sql, params = []) {
        const pool = await this.getPool();
        const [rows] = await pool.execute(sql, params);
        return rows && rows.length > 0 ? rows[0] : null;
    }

    /**
     * Execute an insert/update/delete query
     * @param {string} sql - SQL query
     * @param {Array} params - Query parameters
     * @returns {Promise<Object>} Query result with insertId and affectedRows
     */
    async execute(sql, params = []) {
        const pool = await this.getPool();
        const [result] = await pool.execute(sql, params);
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows
        };
    }

    /**
     * Get database statistics
     * @returns {Promise<Object>} Database statistics
     */
    async getStats() {
        const pool = await this.getPool();
        // User count
        const userCountRow = await this.queryOne('SELECT COUNT(*) as count FROM users');
        // DB size (in bytes) from information_schema
        const dbName = DB_CONFIG.database;
        const dbSizeRow = await this.queryOne(
            `SELECT SUM(data_length + index_length) AS dbSize FROM information_schema.tables WHERE table_schema = ?`,
            [dbName]
        );
        return {
            userCount: userCountRow ? userCountRow.count : 0,
            dbSize: dbSizeRow ? dbSizeRow.dbSize : 0,
            dbName
        };
    }
}

// Export singleton instance
module.exports = new DatabaseService(); 