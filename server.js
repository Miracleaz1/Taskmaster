require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const dbUrl = process.env.MONGO_URL;
console.log('MongoDB URL:', dbUrl); // Debugging

if (!dbUrl) {
    console.error('MongoDB connection URL is undefined. Please check your .env file.');
    process.exit(1); // Exit the process if the URL is undefined
}

mongoose.connect(dbUrl)
    .then(() => {
        console.log('MongoDB connected successfully');
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// Define routes
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));

// Export the app for testing
module.exports = app;

// Start the server if not in test mode
if (require.main === module) {
    const port = process.env.PORT || 4000;
    app.listen(port, () => console.log(`Listening on port ${port}...`));
}
