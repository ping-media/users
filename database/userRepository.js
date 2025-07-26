const db = require('./database');

/**
 * User Repository
 * Handles all database operations for users
 */

class UserRepository {
    /**
     * Get all users with optional pagination and filtering
     * @param {Object} options - Query options
     * @param {number} options.limit - Number of users to return
     * @param {number} options.offset - Number of users to skip
     * @param {string} options.city - Filter by city
     * @param {string} options.gender - Filter by gender
     * @param {string} options.search - Search in name and email
     * @returns {Array} Array of users
     */
    async getAllUsers(options = {}) {
        const { limit, offset, city, gender, search } = options;
        
        let sql = 'SELECT * FROM users WHERE 1=1';
        const params = [];

        // Add filters
        if (city) {
            sql += ' AND city = ?';
            params.push(city);
        }

        if (gender) {
            sql += ' AND gender = ?';
            params.push(gender);
        }

        if (search) {
            sql += ' AND (name LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`);
            params.push(`%${search}%`);
        }

        // Add ordering
        sql += ' ORDER BY created_at DESC';

        // Add pagination
        if (limit) {
            sql += ' LIMIT ?';
            params.push(Number(limit));
        }

        if (offset) {
            sql += ' OFFSET ?';
            params.push(Number(offset));
        }

        return db.query(sql, params);
    }

    /**
     * Get user by ID
     * @param {string} id - User ID
     * @returns {Object|null} User object or null
     */
    async getUserById(id) {
        const sql = 'SELECT * FROM users WHERE id = ?';
        return db.queryOne(sql, [id]);
    }

    /**
     * Get user by email
     * @param {string} email - User email
     * @returns {Object|null} User object or null
     */
    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        return db.queryOne(sql, [email]);
    }

    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Object} Created user
     */
    async createUser(userData) {
        const sql = `
            INSERT INTO users (id, name, email, phone, city, gender, age)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            userData.id,
            userData.name,
            userData.email,
            userData.phone,
            userData.city,
            userData.gender,
            userData.age
        ];

        const result = await db.execute(sql, params);
        
        if (result.affectedRows === 1) {
            return this.getUserById(userData.id);
        }
        
        throw new Error('Failed to create user');
    }

    /**
     * Update user by ID
     * @param {string} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Object|null} Updated user or null
     */
    async updateUser(id, userData) {
        const sql = `
            UPDATE users 
            SET name = ?, email = ?, phone = ?, 
                city = ?, gender = ?, age = ?
            WHERE id = ?
        `;

        const params = [
            userData.name,
            userData.email,
            userData.phone,
            userData.city,
            userData.gender,
            userData.age,
            id
        ];

        const result = await db.execute(sql, params);

        if (result.affectedRows === 1) {
            return this.getUserById(id);
        }

        return null;
    }

    /**
     * Delete user by ID
     * @param {string} id - User ID
     * @returns {boolean} True if user was deleted
     */
    async deleteUser(id) {
        const sql = 'DELETE FROM users WHERE id = ?';
        const result = await db.execute(sql, [id]);
        return result.affectedRows === 1;
    }

    /**
     * Get user count
     * @param {Object} filters - Optional filters
     * @returns {number} Number of users
     */
    async getUserCount(filters = {}) {
        let sql = 'SELECT COUNT(*) as count FROM users WHERE 1=1';
        const params = [];

        if (filters.city) {
            sql += ' AND city = ?';
            params.push(filters.city);
        }

        if (filters.gender) {
            sql += ' AND gender = ?';
            params.push(filters.gender);
        }

        const result = await db.queryOne(sql, params);
        return result.count;
    }

    /**
     * Get users by city
     * @param {string} city - City name
     * @returns {Array} Array of users in the city
     */
    async getUsersByCity(city) {
        const sql = 'SELECT * FROM users WHERE city = ? ORDER BY created_at DESC';
        return db.query(sql, [city]);
    }

    /**
     * Get users by gender
     * @param {string} gender - Gender
     * @returns {Array} Array of users with the specified gender
     */
    async getUsersByGender(gender) {
        const sql = 'SELECT * FROM users WHERE gender = ? ORDER BY created_at DESC';
        return db.query(sql, [gender]);
    }

    /**
     * Search users by name or email
     * @param {string} searchTerm - Search term
     * @returns {Array} Array of matching users
     */
    async searchUsers(searchTerm) {
        const sql = `
            SELECT * FROM users 
            WHERE name LIKE ? OR email LIKE ? 
            ORDER BY created_at DESC
        `;
        return db.query(sql, [`%${searchTerm}%`, `%${searchTerm}%`]);
    }

    /**
     * Get database statistics
     * @returns {Object} Database statistics
     */
    async getStats() {
        const stats = await db.getStats();
        
        // Get additional statistics
        const cityStats = await db.query(`
            SELECT city, COUNT(*) as count 
            FROM users 
            GROUP BY city 
            ORDER BY count DESC
        `);

        const genderStats = await db.query(`
            SELECT gender, COUNT(*) as count 
            FROM users 
            GROUP BY gender 
            ORDER BY count DESC
        `);

        const ageStats = await db.queryOne(`
            SELECT 
                AVG(age) as avgAge,
                MIN(age) as minAge,
                MAX(age) as maxAge
            FROM users
        `);

        return {
            ...stats,
            cityStats,
            genderStats,
            ageStats
        };
    }
}

module.exports = new UserRepository(); 