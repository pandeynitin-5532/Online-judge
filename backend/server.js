const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); // To parse JSON request bodies

let db;

// Initialize Database and Start Server
async function initializeDBAndServer() {
    try {
        db = await open({
            filename: path.join(__dirname, 'database.db'),
            driver: sqlite3.Database
        });

        // Create a simple submissions table for testing later
        await db.exec(`
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                language TEXT,
                code TEXT,
                status TEXT
            );
        `);

        app.listen(5000, () => {
            console.log('Backend Server running at http://localhost:5000/');
        });
    } catch (error) {
        console.error(`Database Error: ${error.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

// Sample API Route
app.get('/api/status', (req, res) => {
    res.json({ message: "Backend is connected and SQLite is ready!" });
});