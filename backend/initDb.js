const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Create the problems table
    db.run(`
        CREATE TABLE IF NOT EXISTS problems (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            input_example TEXT,
            output_example TEXT
        )
    `);

    console.log("Problems table checked/created.");

    // 2. Data array for 10 problems
    const sampleProblems = [
        {
            id: "two-sum",
            title: "Two Sum",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            input: "nums = [2,7,11,15], target = 9",
            output: "[0,1]"
        },
        {
            id: "palindrome-number",
            title: "Palindrome Number",
            description: "Given an integer x, return true if x is a palindrome, and false otherwise.",
            input: "x = 121",
            output: "true"
        },
        {
            id: "fizz-buzz",
            title: "Fizz Buzz",
            description: "Given an integer n, return a string array answer where answer[i] is 'FizzBuzz' if divisible by 3 and 5, 'Fizz' if divisible by 3, 'Buzz' if divisible by 5, or the number as a string.",
            input: "n = 3",
            output: "['1','2','Fizz']"
        },
        {
            id: "reverse-string",
            title: "Reverse String",
            description: "Write a function that reverses a string. The input string is given as an array of characters s.",
            input: "s = ['h','e','l','l','o']",
            output: "['o','l','l','e','h']"
        },
        {
            id: "valid-parentheses",
            title: "Valid Parentheses",
            description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            input: "s = '()[]{}'",
            output: "true"
        },
        {
            id: "merge-sorted-lists",
            title: "Merge Two Sorted Lists",
            description: "Merge two sorted linked lists and return it as a sorted list. The list should be made by splicing together the nodes of the first two lists.",
            input: "list1 = [1,2,4], list2 = [1,3,4]",
            output: "[1,1,2,3,4,4]"
        },
        {
            id: "max-subarray",
            title: "Maximum Subarray",
            description: "Given an integer array nums, find the subarray with the largest sum and return its sum.",
            input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
            output: "6"
        },
        {
            id: "climbing-stairs",
            title: "Climbing Stairs",
            description: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            input: "n = 2",
            output: "2"
        },
        {
            id: "single-number",
            title: "Single Number",
            description: "Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.",
            input: "nums = [4,1,2,1,2]",
            output: "4"
        },
        {
            id: "valid-anagram",
            title: "Valid Anagram",
            description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
            input: "s = 'anagram', t = 'nagaram'",
            output: "true"
        }
    ];

    // 3. Statement template to insert data safely
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO problems (id, title, description, input_example, output_example) 
        VALUES (?, ?, ?, ?, ?)
    `);

    sampleProblems.forEach((prob) => {
        stmt.run(prob.id, prob.title, prob.description, prob.input, prob.output);
    });

    stmt.finalize();
    console.log("Successfully seeded database with 10 coding problems!");
});

db.close();