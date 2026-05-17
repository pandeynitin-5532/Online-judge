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

// ==========================================
// NEW API ROUTES FOR PROBLEMS & SUBMISSIONS
// ==========================================

// 1. Get ALL problems (for the dashboard list)
app.get('/api/problems', async (req, res) => {
    try {
        const rows = await db.all("SELECT id, title FROM problems");
        res.json({ success: true, problems: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Get a SINGLE problem by its ID (for the workspace view)
app.get('/api/problems/:id', async (req, res) => {
    const problemId = req.params.id;
    try {
        const row = await db.get("SELECT * FROM problems WHERE id = ?", [problemId]);
        if (!row) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }
        res.json({ success: true, problem: row });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 3. Temporary Submission Catching Route
app.post('/api/submissions', (req, res) => {
    const { problemId, language, code } = req.body;
  
    console.log(`\n--- New Code Submission Received ---`);
    console.log(`Problem ID: ${problemId}`);
    console.log(`Language: ${language}`);
    console.log(`Code Length: ${code?.length || 0} characters`);
    console.log(`------------------------------------\n`);
  
    res.status(200).json({
      success: true,
      message: `Backend successfully received your ${language} code for problem "${problemId}".`
    });
});