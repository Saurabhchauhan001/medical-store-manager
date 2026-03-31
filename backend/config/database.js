const mongoose = require('mongoose');

let listenersRegistered = false;

function registerConnectionListeners() {
    if (listenersRegistered) {
        return;
    }

    listenersRegistered = true;

    mongoose.connection.on('connected', () => {
        console.log(`Connected to MongoDB database "${mongoose.connection.name}"`);
    });

    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB connection disconnected');
    });

    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error.message);
    });
}

async function connectToDatabase() {
    const mongoUri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB_NAME || 'pharmacy_management';

    if (!mongoUri) {
        throw new Error('MONGO_URI is missing. Add it to backend/.env');
    }

    registerConnectionListeners();

    await mongoose.connect(mongoUri, {
        dbName,
        serverSelectionTimeoutMS: 10000
    });
}

module.exports = connectToDatabase;
