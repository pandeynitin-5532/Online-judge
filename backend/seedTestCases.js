const { open } = require('sqlite');
const sqlite3 = require('sqlite3');
const path = require('path');

async function seed() {
    const db = await open({
        filename: path.join(__dirname, 'database.db'),
        driver: sqlite3.Database
    });

    // Insert simple test cases for Two Sum
    // Let's assume the user's script reads from standard input (stdin)
    await db.run(`
        INSERT OR REPLACE INTO test_cases (id, problem_id, input_data, expected_output)
        VALUES 
        (1, 'two-sum', '2 7 11 15\n9', '[0, 1]'),
        (2, 'palindrome-number', '121', 'True'),
        (3, 'palindrome-number', '-121', 'False');
    `);

    console.log("Test cases seeded successfully!");
    await db.close();
}

seed();