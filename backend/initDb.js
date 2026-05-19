const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

// Type translation matrices for auto-generating code signatures on the fly
const pythonTypeMap = { 'int': 'int', 'bool': 'bool', 'str': 'str', 'list_int': 'list[int]', 'list_str': 'list[str]', 'char_list': 'list[str]', 'void': 'None' };
const cppTypeMap    = { 'int': 'int', 'bool': 'bool', 'str': 'string', 'list_int': 'vector<int>', 'list_str': 'vector<string>', 'char_list': 'vector<char>', 'void': 'void' };
const javaTypeMap   = { 'int': 'int', 'bool': 'boolean', 'str': 'String', 'list_int': 'int[]', 'list_str': 'String[]', 'char_list': 'char[]', 'void': 'void' };

/**
 * Programmatically generates clean LeetCode-style starter code skeletons
 */
function generateTemplate(lang, problem) {
    const { function_name, return_type, args } = problem;
    
    if (lang === 'python') {
        const pyArgs = args.map(a => `${a.name}: ${pythonTypeMap[a.type]}`).join(', ');
        return `class Solution:\n    def ${function_name}(self, ${pyArgs}) -> ${pythonTypeMap[return_type]}:\n        # Write your code here\n        pass`;
    }
    
    if (lang === 'cpp') {
        const cppArgs = args.map(a => `${cppTypeMap[a.type]} ${a.name}`).join(', ');
        return `#include <iostream>\n#include <vector>\n#include <string>\n\nusing namespace std;\n\nclass Solution {\npublic:\n    ${cppTypeMap[return_type]} ${function_name}(${cppArgs}) {\n        // Write your code here\n        \n    }\n};`;
    }
    
    if (lang === 'java') {
        const javaArgs = args.map(a => `${javaTypeMap[a.type]} ${a.name}`).join(', ');
        return `class Solution {\n    public ${javaTypeMap[return_type]} ${function_name}(${javaArgs}) {\n        // Write your code here\n        \n        return${return_type === 'void' ? '' : return_type === 'bool' ? ' false' : return_type === 'int' ? ' 0' : ' null'};\n    }\n}`;
    }
    return '';
}

db.serialize(() => {
    // 1. Rebuild the problems table with complete multi-language template slots
    db.run(`DROP TABLE IF EXISTS problems`);
    db.run(`
        CREATE TABLE IF NOT EXISTS problems (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            input_example TEXT,
            output_example TEXT,
            template_python TEXT,
            template_cpp TEXT,
            template_java TEXT,
            metadata_json TEXT
        )
    `);

    console.log("Problems table successfully recreated with structural metadata support.");

    // 2. Recheck Submissions Ledger Table
    db.run(`
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            problem_id TEXT NOT NULL,
            language TEXT NOT NULL,
            code TEXT NOT NULL,
            verdict TEXT NOT NULL,
            submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (problem_id) REFERENCES problems(id)
        )
    `);

    console.log("Submissions table checked/verified.");

    // 3. Normalized complete problem definitions matrix for all 10 topics
    const sampleProblems = [
        {
            id: "two-sum",
            title: "Two Sum",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            input: "nums = [2,7,11,15]\ntarget = 9",
            output: "[0,1]",
            function_name: "twoSum",
            return_type: "list_int",
            args: [{name: "nums", type: "list_int"}, {name: "target", type: "int"}]
        },
        {
            id: "palindrome-number",
            title: "Palindrome Number",
            description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
            input: "121",
            output: "true",
            function_name: "isPalindrome",
            return_type: "bool",
            args: [{name: "x", type: "int"}]
        },
        {
            id: "fizz-buzz",
            title: "Fizz Buzz",
            description: "Given an integer n, return a string array answer where answer[i] is 'FizzBuzz' if divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, or the number as a string.",
            input: "3",
            output: "['1','2','Fizz']",
            function_name: "fizzBuzz",
            return_type: "list_str",
            args: [{name: "n", type: "int"}]
        },
        {
            id: "reverse-string",
            title: "Reverse String",
            description: "Write a function that reverses a string. The input string is given as an array of characters s.",
            input: "['h','e','l','l','o']",
            output: "['o','l','l','e','h']",
            function_name: "reverseString",
            return_type: "void",
            args: [{name: "s", type: "char_list"}]
        },
        {
            id: "valid-parentheses",
            title: "Valid Parentheses",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            input: "'()[]{}'",
            output: "true",
            function_name: "isValid",
            return_type: "bool",
            args: [{name: "s", type: "str"}]
        },
        {
            id: "merge-sorted-lists",
            title: "Merge Two Sorted Lists",
            description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
            input: "[1,2,4]\n[1,3,4]",
            output: "[1,1,2,3,4,4]",
            function_name: "mergeTwoLists",
            return_type: "list_int",
            args: [{name: "list1", type: "list_int"}, {name: "list2", type: "list_int"}]
        },
        {
            id: "max-subarray",
            title: "Maximum Subarray",
            description: "Given an integer array nums, find the subarray with the largest sum and return its sum.",
            input: "[-2,1,-3,4,-1,2,1,-5,4]",
            output: "6",
            function_name: "maxSubArray",
            return_type: "int",
            args: [{name: "nums", type: "list_int"}]
        },
        {
            id: "climbing-stairs",
            title: "Climbing Stairs",
            description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            input: "2",
            output: "2",
            function_name: "climbStairs",
            return_type: "int",
            args: [{name: "n", type: "int"}]
        },
        {
            id: "single-number",
            title: "Single Number",
            description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
            input: "[4,1,2,1,2]",
            output: "4",
            function_name: "singleNumber",
            return_type: "int",
            args: [{name: "nums", type: "list_int"}]
        },
        {
            id: "valid-anagram",
            title: "Valid Anagram",
            description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
            input: "'anagram'\n'nagaram'",
            output: "true",
            function_name: "isAnagram",
            return_type: "bool",
            args: [{name: "s", type: "str"}, {name: "t", type: "str"}]
        }
    ];

    // 4. Statement blueprint template mapping structural variables cleanly
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO problems (id, title, description, input_example, output_example, template_python, template_cpp, template_java, metadata_json) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    sampleProblems.forEach((prob) => {
        // Build language-specific code block definitions dynamically
        const templatePy = generateTemplate('python', prob);
        const templateCpp = generateTemplate('cpp', prob);
        const templateJava = generateTemplate('java', prob);
        
        // Bundle argument tracking matrix to JSON string cell
        const metadataJson = JSON.stringify({
            functionName: prob.function_name,
            returnType: prob.return_type,
            args: prob.args
        });

        stmt.run(
            prob.id, 
            prob.title, 
            prob.description, 
            prob.input, 
            prob.output, 
            templatePy, 
            templateCpp, 
            templateJava, 
            metadataJson
        );
    });

    stmt.finalize();
    console.log("🚀 Successfully compiled and seeded all 10 problems with templates for Python, C++, and Java!");

    // =================================================================
    // INSERTED HERE: Re-create and seed your test cases table
    // =================================================================
    db.run(`DROP TABLE IF EXISTS test_cases`);
    db.run(`
        CREATE TABLE IF NOT EXISTS test_cases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            problem_id TEXT NOT NULL,
            input_data TEXT NOT NULL,
            expected_output TEXT NOT NULL,
            FOREIGN KEY (problem_id) REFERENCES problems(id)
        )
    `);

    console.log("Test Cases table checked/created.");

    const tcStmt = db.prepare(`
        INSERT INTO test_cases (problem_id, input_data, expected_output)
        VALUES (?, ?, ?)
    `);

    // Seed data matching the LeetCode input structure (args separated by newlines)
    // 1. Two Sum Test Cases
    tcStmt.run("two-sum", "[2,7,11,15]\n9", "[0,1]");
    tcStmt.run("two-sum", "[3,2,4]\n6", "[1,2]");

    // 2. Palindrome Number Test Cases
    tcStmt.run("palindrome-number", "121", "true");
    tcStmt.run("palindrome-number", "-121", "false");
    tcStmt.run("palindrome-number", "10", "false");

    // 3. Fizz Buzz
    tcStmt.run("fizz-buzz", "3", "['1','2','Fizz']");

    // 4. Reverse String
    tcStmt.run("reverse-string", "['h','e','l','l','o']", "['o','l','l','e','h']");

    // 5. Valid Parentheses
    tcStmt.run("valid-parentheses", "'()[]{}'", "true");

    // 6. Merge Sorted Lists
    tcStmt.run("merge-sorted-lists", "[1,2,4]\n[1,3,4]", "[1,1,2,3,4,4]");

    // 7. Maximum Subarray
    tcStmt.run("max-subarray", "[-2,1,-3,4,-1,2,1,-5,4]", "6");

    // 8. Climbing Stairs
    tcStmt.run("climbing-stairs", "2", "2");

    // 9. Single Number
    tcStmt.run("single-number", "[4,1,2,1,2]", "4");

    // 10. Valid Anagram
    tcStmt.run("valid-anagram", "'anagram'\n'nagaram'", "true");

    tcStmt.finalize();
    console.log("🚀 Core test cases successfully seeded into database storage!");
}); // <--- This closes the original db.serialize loop


db.close();