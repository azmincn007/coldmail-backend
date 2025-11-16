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

// Start the server
async function startServer() {
    try {
        // Initialize the application
        await initializeApp();
        
        // Start Express server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT}/stats to view email statistics`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    // Close MongoDB connection
    const mongoose = require('mongoose');
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed successfully');
        process.exit(0);
    });
});

// Start the application
startServer();