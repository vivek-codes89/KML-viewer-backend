const express = require('express');
const cors = require('cors');
const kmlRoutes = require('./routes/kmlRoutes');
require('dotenv').config();
const connectDB = require("./config/db");


connectDB();

const app = express();
const port = process.env.PORT || 8000;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', kmlRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});