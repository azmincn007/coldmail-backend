const mongoose = require('mongoose');

const connection = async () => {
    try {
        const connect = await mongoose.connect("mongodb+srv://azminsazz:azmin2000@cluster0.tsyhhu4.mongodb.net/Cold-Email?retryWrites=true&w=majority");
        console.log("MongoDB connection successful");
        return connect;
    } catch (error) {
        console.log('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connection;