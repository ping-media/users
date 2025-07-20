const express = require('express');
const path = require('path');

// Import routes
const userRoutes = require('./routes/users');

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

// Routes
app.use('/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Users CRUD API',
        version: '1.0.0',
        endpoints: {
            'POST /users': 'Create a new user',
            'GET /users': 'Get all users',
            'GET /users/:id': 'Get user by ID',
            'POST /users/:id': 'Update user by ID',
            'DELETE /users/:id': 'Delete user by ID'
        },
        documentation: {
            userSchema: {
                id: 'UUID (auto-generated)',
                name: 'string (required)',
                email: 'string (required, valid email format)',
                phone: 'string (required)',
                city: 'string (required)',
                gender: 'string (required: male, female, or other)',
                age: 'number (required, 0-150)'
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
            'POST /users',
            'GET /users',
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

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`📖 API Documentation: http://localhost:${PORT}`);
    console.log(`👥 Users API: http://localhost:${PORT}/users`);
    console.log(`📁 Data file: ${path.join(__dirname, 'data.json')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app; 