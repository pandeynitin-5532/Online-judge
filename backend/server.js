const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const { executeCode } = require('./executeCode');

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

        // 1. Create Submissions Table (Aligned with your required schema columns)
        await db.exec(`
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id TEXT NOT NULL,
                language TEXT NOT NULL,
                code TEXT NOT NULL,
                verdict TEXT NOT NULL,
                submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Create Test Cases Table
        await db.exec(`
            CREATE TABLE IF NOT EXISTS test_cases (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_id TEXT,
                input_data TEXT,
                expected_output TEXT,
                FOREIGN KEY (problem_id) REFERENCES problems(id)
            );
        `);

        console.log('Database tables verified successfully.');

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
// API ROUTES FOR PROBLEMS & SUBMISSIONS
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

// 3. Dynamic Submission and True Evaluation Loop Route
app.post('/api/submissions', async (req, res) => {
    const { problemId, language, code } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({ success: false, message: "Missing code, language, or problem configuration." });
    }

    try {
        console.log(`\n[Judging System] Fetching test cases for: ${problemId}`);

        // Fetch all matching test cases from SQLite
        const testCases = await db.all("SELECT * FROM test_cases WHERE problem_id = ?", [problemId]);

        // Run the code through your execution engine
        const verdict = await executeCode(language, code, testCases);

        // Fixed: Using async/await structure with the promise-based wrapper
        await db.run(
            `INSERT INTO submissions (problem_id, language, code, verdict) VALUES (?, ?, ?, ?)`,
            [problemId, language, code, verdict]
        );

        console.log(`[Database Log] Submission saved successfully into history.`);

        // Return the evaluation result directly back to your React app
        return res.json({ success: true, verdict: verdict });

    } catch (error) {
        console.error("Critical evaluation failure within route handler:", error);
        return res.status(500).json({ success: false, message: "Server error executing the judging pipeline." });
    }
});

// 4. GET endpoint to fetch execution history for a single problem
app.get('/api/problems/:id/submissions', async (req, res) => {
    const problemId = req.params.id;

    try {
        // Fixed: Using async/await structure with the promise-based wrapper
        const rows = await db.all(
            `SELECT id, language, code, verdict, submitted_at 
             FROM submissions 
             WHERE problem_id = ? 
             ORDER BY submitted_at DESC`,
            [problemId]
        );
        
        // Send the array of past submissions back to the frontend
        return res.json(rows);
    } catch (error) {
        console.error("Error running history query:", error.message);
        return res.status(500).json({ success: false, error: "Failed to grab historical log rows." });
    }
});