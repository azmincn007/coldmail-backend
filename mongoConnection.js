const mongoose = require('mongoose');

const connection = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb+srv://azminsazz:azmin2000@cluster0.tsyhhu4.mongodb.net/Cold-Email?retryWrites=true&w=majority";
        const connect = await mongoose.connect(mongoUri);
        console.log("MongoDB connection successful");
        return connect;
    } catch (error) {
        console.log('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connection;