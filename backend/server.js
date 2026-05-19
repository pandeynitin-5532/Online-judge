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

// Sample API Status Route
app.get('/api/status', (req, res) => {
    res.json({ message: "Backend is connected and SQLite is ready!" });
});

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
        const testCases = await db.all("SELECT * FROM test_cases WHERE problem_id = ?", [problemId]);
        const verdict = await executeCode(language, code, testCases);

        // Generate a localized ISO timestamp string to override SQLite's default UTC clock
        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localISOTime = new Date(now.getTime() - offsetMs).toISOString().replace('T', ' ').slice(0, 19);

        await db.run(
            `INSERT INTO submissions (problem_id, language, code, verdict, submitted_at) VALUES (?, ?, ?, ?, ?)`,
            [problemId, language, code, verdict, localISOTime]
        );

        console.log(`[Database Log] Submission saved successfully into history with local timestamp: ${localISOTime}`);
        return res.json({ success: true, verdict: verdict });

    } catch (error) {
        console.error("Critical evaluation failure within route handler:", error);
        return res.status(500).json({ success: false, message: "Server error executing the judging pipeline." });
    }
});

// 4. Ephemeral Testcase Playground Route
app.post('/api/run-code', async (req, res) => {
    const { problemId, language, code, customInput } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({ success: false, message: "Missing required execution parameters." });
    }

    try {
        console.log(`\n[Playground Engine] Running ad-hoc testing for problem: ${problemId} (${language})`);

        const mockTestCases = [{
            problem_id: problemId,
            input_data: customInput || "",
            expected_output: "" 
        }];

        const rawVerdict = await executeCode(language, code, mockTestCases);

        let responsePayload = {
            status: "Success",
            stdout: rawVerdict
        };

        if (rawVerdict.toLowerCase().includes("error") || rawVerdict.toLowerCase().includes("failed")) {
            responsePayload.status = "Runtime Error";
            responsePayload.compile_error = rawVerdict;
        }

        return res.json(responsePayload);

    } catch (error) {
        console.error("Playground processing error:", error);
        return res.status(500).json({ 
            status: "Runtime Error", 
            stderr: "Internal judging matrix failed to process runner execution loop." 
        });
    }
});

// 5. GET endpoint to fetch execution history for a single problem
app.get('/api/problems/:id/submissions', async (req, res) => {
    const problemId = String(req.params.id); 
    try {
        const rows = await db.all(
            `SELECT id, language, code, verdict, submitted_at 
             FROM submissions 
             WHERE problem_id = ? 
             ORDER BY submitted_at DESC`,
            [problemId]
        );
        return res.json({ success: true, submissions: rows });
    } catch (error) {
        console.error("Error running history query:", error.message);
        return res.status(500).json({ success: false, error: "Failed to grab historical log rows." });
    }
});

// 6. NEW: Dynamic Leaderboard Analytics Processing Route
app.get('/api/leaderboard', async (req, res) => {
    try {
        const rows = await db.all("SELECT problem_id, language, verdict FROM submissions ORDER BY submitted_at DESC");
        
        const userStats = {
            "Root_Admin": { solved: new Set(), total: 0, languages: {} },
            "Cipher_Ghost": { solved: new Set(), total: 0, languages: {} },
            "Matrix_Rebel": { solved: new Set(), total: 0, languages: {} }
        };

        rows.forEach((row, index) => {
            let handle = "Root_Admin";
            if (index % 3 === 1) handle = "Cipher_Ghost";
            if (index % 3 === 2) handle = "Matrix_Rebel";

            userStats[handle].total += 1;
            userStats[handle].languages[row.language] = (userStats[handle].languages[row.language] || 0) + 1;
            
            if (row.verdict && (row.verdict.includes("AC") || row.verdict.toLowerCase().includes("accepted"))) {
                userStats[handle].solved.add(row.problem_id);
            }
        });

        const leaderboard = Object.keys(userStats).map(handle => ({
            handle,
            solvedCount: userStats[handle].solved.size,
            totalSubmissions: userStats[handle].total,
            topLanguage: Object.keys(userStats[handle].languages).sort((a,b) => userStats[handle].languages[b] - userStats[handle].languages[a])[0] || "None"
        })).sort((a, b) => b.solvedCount - a.solvedCount || b.totalSubmissions - a.totalSubmissions);

        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;