require('dotenv').config(); // Absolute top of the file to guarantee variable injection

const express = require('express');
const cors = require('cors');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { executeCode } = require('./executeCode');

const app = express();

// Enable universal CORS cross-origin mappings for deployment access routes
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json()); // To parse JSON request bodies

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_COSMIC_SECRET_KEY_99X';
let db;

// Nodemailer SMTP Transporter Configuration Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, // Your Gmail account string
        pass: process.env.EMAIL_PASS  // Your 16-character secure App Password
    }
});

// Initialize Database Connection and Start Server Frame
async function initializeDBAndServer() {
    try {
        db = await open({
            filename: path.join(__dirname, 'database.db'),
            driver: sqlite3.Database
        });

        console.log('Database connected successfully. Schema tracking synchronized.');
        console.log('Loaded Email Target:', process.env.EMAIL_USER); 

        // Dynamic Port Allocation: Essential for deployment platforms like Railway/Render
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Backend Server running dynamically on port ${PORT}`);
        });
    } catch (error) {
        console.error(`Database Initialization Error: ${error.message}`);
        process.exit(1);
    }
}

initializeDBAndServer();

// --- IDENTITY ACCESS MANAGEMENT MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access Token Missing' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid or Expired Token' });
        }
        req.user = user;
        next();
    });
};

// --- PHASE 1: IDENTITY ACCESS MANAGEMENT ROUTES ---

// Step 1: Request 6-Digit Passwordless Verification OTP Code via SMTP
app.post('/api/auth/otp-request', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email address field required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minute validity window

    try {
        // Upsert user row tracking metadata inside SQLite matrix
        await db.run(
            `INSERT INTO users (email, otp_code, otp_expires) 
             VALUES (?, ?, ?) 
             ON CONFLICT(email) DO UPDATE SET otp_code = ?, otp_expires = ?`,
            [email, otp, expires, otp, expires]
        );

        // Dispatch transitional verification code email message
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: '🔥 Your Master OJ Verification Code',
            text: `Your temporary 6-digit access token is: ${otp}. It expires in 5 minutes.`
        });

        return res.json({ success: true, message: 'Verification OTP token dispatched successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Failed to process authorization transaction request.' });
    }
});

// Step 2: Confirm Token Integrity and Exchange for Signed Session JWT
app.post('/api/auth/otp-verify', async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ success: false, message: 'Missing credentials fields' });

    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);

        if (!user || user.otp_code !== otp || Date.now() > user.otp_expires) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification parameters.' });
        }

        // Clear spent authentication code keys
        await db.run('UPDATE users SET otp_code = NULL, otp_expires = NULL WHERE id = ?', [user.id]);

        // Evaluate onboarding baseline completion criteria
        const isOnboarded = !!(user.nickname && user.dob && user.profession);
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        return res.json({ 
            success: true, 
            token, 
            isOnboarded, 
            user: { id: user.id, nickname: user.nickname, email: user.email } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
});

// Step 3: Complete Demographic Operator Onboarding Data Specification
app.post('/api/auth/onboard', authenticateToken, async (req, res) => {
    const { nickname, dob, profession } = req.body;
    if (!nickname || !dob || !profession) {
        return res.status(400).json({ success: false, message: 'Missing profile parameter selections.' });
    }

    try {
        await db.run(
            'UPDATE users SET nickname = ?, dob = ?, profession = ? WHERE id = ?',
            [nickname, dob, profession, req.user.id]
        );
        return res.json({ success: true, message: 'Onboarding matrix complete. Identity authenticated.' });
    } catch (error) {
        return res.status(400).json({ success: false, message: 'Callsign taken. Choose another name.' });
    }
});

// --- CORE CORE EVALUATION ENGINE ROUTE UPDATES ---

// Sample Status Verification Probe Route
app.get('/api/status', (req, res) => {
    res.json({ message: "Backend is connected and SQLite is ready!" });
});

// Get ALL dashboard system configuration nodes
app.get('/api/problems', async (req, res) => {
    try {
        const rows = await db.all("SELECT id, title FROM problems");
        res.json({ success: true, problems: rows });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get a SINGLE isolated challenge block configuration by index descriptor
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

// Updated True Submission Evaluation Loop incorporating execution telemetry mappings
app.post('/api/submissions', authenticateToken, async (req, res) => {
    const { problemId, language, code } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({ success: false, message: "Missing code, language, or problem configuration." });
    }

    try {
        console.log(`\n[Judging System] Fetching test cases for user ${req.user.id}: ${problemId}`);
        const testCases = await db.all("SELECT * FROM test_cases WHERE problem_id = ?", [problemId]);
        
        // Deconstruct structural status and millisecond delta values directly from run wrapper
        const { status, runtime_ms } = await executeCode(language, code, testCases);

        const now = new Date();
        const offsetMs = now.getTimezoneOffset() * 60 * 1000;
        const localISOTime = new Date(now.getTime() - offsetMs).toISOString().replace('T', ' ').slice(0, 19);

        await db.run(
            `INSERT INTO submissions (user_id, problem_id, language, code, status, runtime_ms, created_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, problemId, language, code, status, runtime_ms, localISOTime]
        );

        console.log(`[Database Log] Submission recorded with speed metric: ${runtime_ms} ms`);
        return res.json({ success: true, verdict: status, runtime_ms });

    } catch (error) {
        console.error("Critical evaluation failure within route handler:", error);
        return res.status(500).json({ success: false, message: "Server error executing the judging pipeline." });
    }
});

// Ephemeral Testcase Run Playground Loop Update
app.post('/api/run-code', authenticateToken, async (req, res) => {
    const { problemId, language, code, customInput } = req.body;

    if (!code || !language || !problemId) {
        return res.status(400).json({ success: false, message: "Missing required execution parameters." });
    }

    try {
        console.log(`\n[Playground Engine] Running ad-hoc testing for user ${req.user.id}: ${problemId}`);

        const mockTestCases = [{
            problem_id: problemId,
            input_data: customInput || "",
            expected_output: "" 
        }];

        const { status, runtime_ms } = await executeCode(language, code, mockTestCases);

        return res.json({
            status: status === "ACCEPTED" ? "Success" : "Runtime Error",
            stdout: status,
            runtime_ms
        });

    } catch (error) {
        console.error("Playground processing error:", error);
        return res.status(500).json({ 
            status: "Runtime Error", 
            stderr: "Internal judging matrix failed to process runner execution loop." 
        });
    }
});

// Fetch user execution logs filtered specifically against problem context parameters
app.get('/api/problems/:id/submissions', authenticateToken, async (req, res) => {
    const problemId = String(req.params.id); 
    try {
        const rows = await db.all(
            `SELECT id, language, code, status AS verdict, runtime_ms, created_at AS submitted_at 
             FROM submissions 
             WHERE problem_id = ? AND user_id = ?
             ORDER BY created_at DESC`,
            [problemId, req.user.id]
        );
        return res.json({ success: true, submissions: rows });
    } catch (error) {
        console.error("Error running history query:", error.message);
        return res.status(500).json({ success: false, error: "Failed to grab historical log rows." });
    }
});

// --- PHASE 4: THE SPEEDRUN LEADERBOARD MATRIX AGGREGATIONS ---

// Global Leaderboard Matrix Data Processing View Target
app.get('/api/leaderboard', async (req, res) => {
    try {
        const globalMatrix = await db.all(`
            SELECT 
                u.id AS user_id,
                u.nickname AS handle,
                u.profession,
                COUNT(DISTINCT CASE WHEN s.status = 'ACCEPTED' THEN s.problem_id END) AS solvedCount,
                COUNT(s.id) AS totalSubmissions,
                AVG(CASE WHEN s.status = 'ACCEPTED' THEN s.runtime_ms END) AS avgSpeedMs
            FROM users u
            INNER JOIN submissions s ON u.id = s.user_id
            GROUP BY u.id
            ORDER BY solvedCount DESC, avgSpeedMs ASC
            LIMIT 100
        `);
        
        // Map data formatting options to support structural backward compatibility layout
        const leaderboard = globalMatrix.map(row => ({
            handle: row.handle || 'Anonymous Operator',
            solvedCount: row.solvedCount,
            totalSubmissions: row.totalSubmissions,
            avgSpeedMs: row.avgSpeedMs,
            topLanguage: "Analyzed" 
        }));

        res.json({ success: true, leaderboard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Problem-Specific Inner Segment Solution Speedrun Ranking Target
app.get('/api/leaderboard/problem/:problemId', async (req, res) => {
    const { problemId } = req.params;
    try {
        const structuralLeaderboard = await db.all(`
            SELECT 
                u.nickname AS handle,
                s.language,
                MIN(s.runtime_ms) AS best_runtime_ms,
                s.created_at AS solve_date
            FROM submissions s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.problem_id = ? AND s.status = 'ACCEPTED'
            GROUP BY s.user_id, s.language
            ORDER BY best_runtime_ms ASC
            LIMIT 10
        `, [problemId]);

        res.json({ success: true, leaderboard: structuralLeaderboard });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = app;