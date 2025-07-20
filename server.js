const express = require('express');
const path = require('path');

// Import routes
const userRoutes = require('./routes/users');

// Import database initialization
const { initializeDatabase } = require('./database/init');

/**
 * Express Server Configuration
 * Main entry point for the CRUD REST API
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// CORS middleware for cross-origin requests
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Users CRUD API',
        database: 'SQLite'
    });
});

// Routes
app.use('/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Users CRUD API with SQLite Database',
        version: '2.0.0',
        database: 'SQLite',
        endpoints: {
            'GET /health': 'Health check',
            'POST /users': 'Create a new user',
            'GET /users': 'Get all users (with filtering & pagination)',
            'GET /users/search?q=term': 'Search users by name or email',
            'GET /users/stats': 'Get database statistics',
            'GET /users/city/:city': 'Get users by city',
            'GET /users/gender/:gender': 'Get users by gender',
            'GET /users/:id': 'Get user by ID',
            'POST /users/:id': 'Update user by ID',
            'DELETE /users/:id': 'Delete user by ID'
        },
        queryParameters: {
            'limit': 'Number of users to return (pagination)',
            'offset': 'Number of users to skip (pagination)',
            'city': 'Filter users by city',
            'gender': 'Filter users by gender',
            'search': 'Search in name and email fields'
        },
        documentation: {
            userSchema: {
                id: 'UUID (auto-generated)',
                name: 'string (required)',
                email: 'string (required, valid email format, unique)',
                phone: 'string (required)',
                city: 'string (required)',
                gender: 'string (required: male, female, or other)',
                age: 'number (required, 0-150)',
                created_at: 'datetime (auto-generated)',
                updated_at: 'datetime (auto-updated)'
            }
        }
    });
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        availableRoutes: [
            'GET /',
            'GET /health',
            'POST /users',
            'GET /users',
            'GET /users/search',
            'GET /users/stats',
            'GET /users/city/:city',
            'GET /users/gender/:gender',
            'GET /users/:id',
            'POST /users/:id',
            'DELETE /users/:id'
        ]
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Initialize database and start server
async function startServer() {
    try {
        // Initialize database
        await initializeDatabase();
        console.log('✅ Database initialized successfully');

        // Start server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📖 API Documentation: http://localhost:${PORT}`);
            console.log(`👥 Users API: http://localhost:${PORT}/users`);
            console.log(`💚 Health Check: http://localhost:${PORT}/health`);
            console.log(`📊 Statistics: http://localhost:${PORT}/users/stats`);
            console.log(`🗄️  Database: SQLite (${path.join(__dirname, 'data', 'users.db')})`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

// Start the server
startServer();

module.exports = app; 