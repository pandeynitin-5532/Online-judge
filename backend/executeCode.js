const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputPath = path.join(__dirname, 'codes');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Runs a single generated binary/file instance against an individual string input
 */
const runSingleTest = (command, inputStr, outputPath, uniqueId, language) => {
    return new Promise((resolve) => {
        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, output: stderr || error.message });
            } else {
                resolve({ success: true, output: stdout.trim() });
            }
        });

        // Safeguard chunk conversions: cast to string and stream it to stdin
        if (inputStr && child.stdin) {
            child.stdin.write(String(inputStr) + "\n");
            child.stdin.end();
        } else if (child.stdin) {
            child.stdin.end();
        }
    });
};

/**
 * Executes code across ALL fetched test cases from your SQLite database
 * @param {string} language - 'python', 'cpp', or 'java'
 * @param {string} code - The raw source code string
 * @param {Array} testCases - Array of objects from your SQLite query rows
 * @returns {Promise<string>} - Returns verdict string like "🎉 Accepted (AC)"
 */
const executeCode = async (language, code, testCases = []) => {
    // If no test cases exist in the system, prevent hanging loops
    if (!testCases || testCases.length === 0) {
        return "❌ Missing Test Cases Configuration";
    }

    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    
    let fileExtension = '';
    if (language === 'python') fileExtension = 'py';
    else if (language === 'cpp') fileExtension = 'cpp';
    else if (language === 'java') fileExtension = 'java';

    const filename = language === 'java' ? `Main_${uniqueId}.java` : `${uniqueId}.${fileExtension}`;
    const filePath = path.join(outputPath, filename);

    // 1. Write the user code out to local storage sandbox disc space
    fs.writeFileSync(filePath, code);

    let command = '';
    if (language === 'python') {
        command = `python "${filePath}"`; 
    } else if (language === 'cpp') {
        const exeBinaryPath = path.join(outputPath, `${uniqueId}.out`);
        command = `g++ "${filePath}" -o "${exeBinaryPath}" && "${exeBinaryPath}"`;
    } else if (language === 'java') {
        command = `javac "${filePath}" && java -cp "${outputPath}" Main_${uniqueId}`;
    }

    let verdict = "🎉 Accepted (AC)"; // Default option assuming success initially

    // 2. Loop through each row fetched from your SQLite schema array cleanly
    for (let i = 0; i < testCases.length; i++) {
        const currentCase = testCases[i];
        
        // Grab values cleanly based on your actual server table columns
        const inputString = currentCase.input_data || '';
        
        // Sanitize the database's expected output: strip spaces, quotes, linebreaks, and lowercase it
        const expectedString = (currentCase.expected_output || '')
            .replace(/['"\r\n\s]/g, '')
            .toLowerCase();

        // Run the process instance for this test case
        const result = await runSingleTest(command, inputString, outputPath, uniqueId, language);

        if (!result.success) {
            verdict = `❌ Runtime Error / Compilation Failed`;
            break; 
        }

        // Sanitize the code's console output exactly the same way
        const actualOutput = (result.output || '')
            .replace(/['"\r\n\s]/g, '')
            .toLowerCase();

        // Compare the completely normalized strings
        if (actualOutput !== expectedString) {
            verdict = `❌ Wrong Answer (WA) on Test Case ${i + 1}`;
            break; // Stop executing on first mismatch like standard judges do
        }
    }

    // 3. Complete cleanup routine files synchronously to free storage tracks safely
    try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (language === 'cpp') {
            const exeBinaryPath = path.join(outputPath, `${uniqueId}.out`);
            if (fs.existsSync(exeBinaryPath)) fs.unlinkSync(exeBinaryPath);
        }
        if (language === 'java') {
            const classPath = path.join(outputPath, `Main_${uniqueId}.class`);
            if (fs.existsSync(classPath)) fs.unlinkSync(classPath);
        }
    } catch (cleanupError) {
        console.error("Storage cleanup error:", cleanupError);
    }

    return verdict;
};

module.exports = { executeCode };