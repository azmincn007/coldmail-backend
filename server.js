require('dotenv').config();
const express = require('express');
const { initializeApp } = require('./controllers/appController');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Register routes
app.use('/', routes);

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    process.exit(1);
});

// Start the server
async function startServer() {
    try {
        // Log environment for debugging
        console.log('Environment:', process.env.NODE_ENV || 'development');
        console.log('IS_DEVELOPMENT:', process.env.IS_DEVELOPMENT);
        console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'NOT SET');
        
        // Initialize the application
        await initializeApp();
        
        // Start Express server
        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT}/stats to view email statistics`);
            console.log(`Health check endpoint: http://localhost:${PORT}/health`);
        });
        
        // Handle graceful shutdown
        process.on('SIGINT', () => {
            console.log('Shutting down gracefully...');
            // Close MongoDB connection
            const mongoose = require('mongoose');
            mongoose.connection.close(() => {
                console.log('MongoDB connection closed successfully');
                server.close(() => {
                    console.log('Server closed successfully');
                    process.exit(0);
                });
            });
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the application
startServer();