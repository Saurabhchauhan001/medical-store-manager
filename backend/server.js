const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectToDatabase = require('./config/database');

dotenv.config({ quiet: true });

const inventoryRoutes = require('./routes/inventory');
const supplierRoutes = require('./routes/suppliers');
const saleRoutes = require('./routes/sales');
const reportRoutes = require('./routes/reports');
const alertRoutes = require('./routes/alerts');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/alerts', alertRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled server error:', err);
    res.status(500).json({
        message: 'Unexpected server error',
        error: err.message
    });
});

async function startServer() {
    try {
        await connectToDatabase();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

        const shutdown = (signal) => {
            console.log(`${signal} received. Closing server...`);
            server.close(async () => {
                await mongoose.connection.close();
                process.exit(0);
            });
        };

        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('SIGTERM', () => shutdown('SIGTERM'));
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
}

startServer();
