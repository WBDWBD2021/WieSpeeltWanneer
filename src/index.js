require('dotenv').config();

// Force restart
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const playerRoutes = require('./routes/playerRoutes');
const matchRoutes = require('./routes/matchRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const importRoutes = require('./routes/importRoutes');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Debug middleware voor alle requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Serve static files from the React frontend app
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api', playerRoutes);
app.use('/api', matchRoutes);
app.use('/api', availabilityRoutes);
app.use('/api', importRoutes);
app.use('/api', require('./routes/clubRoutes'));
app.use('/api', require('./routes/competitionRoutes'));
app.use('/api', require('./routes/teamRoutes'));

// Anything that doesn't match the above routes, send back index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({ message: 'Er is iets misgegaan!' });
});

// 404 handler (Optional now, since * catches everything, but good for API specific 404s if placed before *)
// Note: API 404s should ideally be handled before the * route if strict API separation is desired. 
// For simplicity in this setup, the * route catches "page not found" for the UI.


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
    console.log('Geregistreerde routes:');
    console.log('- GET  /api/test');
    console.log('- GET  /api/spelers');
    console.log('- POST /api/spelers');
    console.log('- GET  /api/spelers/:id');
    console.log('- PUT  /api/spelers/:id');
    console.log('- DELETE /api/spelers/:id');
}); 