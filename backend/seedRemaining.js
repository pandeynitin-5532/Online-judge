const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const remainingMatrix = [
  {
    id: 'fizz-buzz',
    title: 'Fizz Buzz',
    description: 'Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == i (as a string) if none of the conditions match.',
    input_example: '3',
    output_example: '["1","2","Fizz"]',
    template_python: 'class Solution:\n    def fizzBuzz(self, n: int) -> list[str]:\n        pass',
    template_cpp: '#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    std::vector<std::string> fizzBuzz(int n) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public String[] fizzBuzz(int n) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'fizzBuzz',
      returnType: 'list_str',
      args: [{ name: 'n', type: 'int' }]
    }),
    test_cases: [
      { input_data: '3', expected_output: '["1","2","Fizz"]' },
      { input_data: '5', expected_output: '["1","2","Fizz","4","Buzz"]' }
    ]
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s. You must modify the input array in-place with O(1) extra memory.',
    input_example: '["h","e","l","l","o"]',
    output_example: '["o","l","l","e","h"]',
    template_python: 'class Solution:\n    def reverseString(self, s: list[str]) -> list[str]:\n        pass',
    template_cpp: '#include <vector>\n#include <string>\n\nclass Solution {\npublic:\n    std::vector<std::string> reverseString(std::vector<std::string>& s) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public String[] reverseString(String[] s) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'reverseString',
      returnType: 'list_str',
      args: [{ name: 's', type: 'char_list' }]
    }),
    test_cases: [
      { input_data: '["h","e","l","l","o"]', expected_output: '["o","l","l","e","h"]' },
      { input_data: '["H","a","n","n","a","h"]', expected_output: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid based on closing tags.',
    input_example: '"()"',
    output_example: 'true',
    template_python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        pass',
    template_cpp: '#include <string>\n\nclass Solution {\npublic:\n    bool isValid(std::string s) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'isValid',
      returnType: 'bool',
      args: [{ name: 's', type: 'str' }]
    }),
    test_cases: [
      { input_data: '"()"', expected_output: 'true' },
      { input_data: '"(]"', expected_output: 'false' }
    ]
  },
  {
    id: 'merge-two-sorted-lists',
    title: 'Merge Two Sorted Lists',
    description: 'Given two sorted integer arrays list1 and list2, merge them into a single sorted array output.',
    input_example: '[1,2,4]\n[1,3,4]',
    output_example: '[1,1,2,3,4,4]',
    template_python: 'class Solution:\n    def mergeTwoLists(self, list1: list[int], list2: list[int]) -> list[int]:\n        pass',
    template_cpp: '#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> mergeTwoLists(std::vector<int>& list1, std::vector<int>& list2) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public int[] mergeTwoLists(int[] list1, int[] list2) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'mergeTwoLists',
      returnType: 'list_int',
      args: [{ name: 'list1', type: 'list_int' }, { name: 'list2', type: 'list_int' }]
    }),
    test_cases: [
      { input_data: '[1,2,4]\n[1,3,4]', expected_output: '[1,1,2,3,4,4]' },
      { input_data: '[]\n[0]', expected_output: '[0]' }
    ]
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    description: 'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    input_example: '[-2,1,-3,4,-1,2,1,-5,4]',
    output_example: '6',
    template_python: 'class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        pass',
    template_cpp: '#include <vector>\n\nclass Solution {\npublic:\n    int maxSubArray(std::vector<int>& nums) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'maxSubArray',
      returnType: 'int',
      args: [{ name: 'nums', type: 'list_int' }]
    }),
    test_cases: [
      { input_data: '[-2,1,-3,4,-1,2,1,-5,4]', expected_output: '6' },
      { input_data: '[-1]', expected_output: '-1' }
    ]
  },
  {
    id: 'valid-anagram',
    title: 'Valid Anagram',
    description: 'Given two strings s and t, return true if t is an anagram of s, and false otherwise.',
    input_example: '"anagram"\n"nagaram"',
    output_example: 'true',
    template_python: 'class Solution:\n    def isAnagram(self, s: str, t: str) -> bool:\n        pass',
    template_cpp: '#include <string>\n\nclass Solution {\npublic:\n    bool isAnagram(std::string s, std::string t) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public boolean isAnagram(String s, String t) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'isAnagram',
      returnType: 'bool',
      args: [{ name: 's', type: 'str' }, { name: 't', type: 'str' }]
    }),
    test_cases: [
      { input_data: '"anagram"\n"nagaram"', expected_output: 'true' },
      { input_data: '"rat"\n"car"', expected_output: 'false' }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.',
    input_example: '[-1,0,3,5,9,12]\n9',
    output_example: '4',
    template_python: 'class Solution:\n    def search(self, nums: list[int], target: int) -> int:\n        pass',
    template_cpp: '#include <vector>\n\nclass Solution {\npublic:\n    int search(std::vector<int>& nums, int target) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'search',
      returnType: 'int',
      args: [{ name: 'nums', type: 'list_int' }, { name: 'target', type: 'int' }]
    }),
    test_cases: [
      { input_data: '[-1,0,3,5,9,12]\n9', expected_output: '4' },
      { input_data: '[-1,0,3,5,9,12]\n2', expected_output: '-1' }
    ]
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
    input_example: '2',
    output_example: '2',
    template_python: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        pass',
    template_cpp: '#include <vector>\n\nclass Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public int climbStairs(int n) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'climbStairs',
      returnType: 'int',
      args: [{ name: 'n', type: 'int' }]
    }),
    test_cases: [
      { input_data: '2', expected_output: '2' },
      { input_data: '3', expected_output: '3' }
    ]
  }
];

const stmtProblem = db.prepare(`
  INSERT OR REPLACE INTO problems (id, title, description, input_example, output_example, template_python, template_cpp, template_java, metadata_json)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const stmtTestCase = db.prepare(`
  INSERT INTO test_cases (problem_id, input_data, expected_output)
  VALUES (?, ?, ?)
`);

db.serialize(() => {
  console.log('--- Initializing Complete 8-Problem Matrix Seeder ---');

  remainingMatrix.forEach((p) => {
    stmtProblem.run(p.id, p.title, p.description, p.input_example, p.output_example, p.template_python, p.template_cpp, p.template_java, p.metadata_json, (err) => {
      if (err) console.error(`❌ Error inserting ${p.id}:`, err.message);
      else console.log(`[Success] Seeded problem index: ${p.title}`);
    });

    db.run("DELETE FROM test_cases WHERE problem_id = ?", [p.id], (err) => {
      if (!err) {
        p.test_cases.forEach((tc) => {
          stmtTestCase.run(p.id, tc.input_data, tc.expected_output);
        });
      }
    });
  });
});

db.close((err) => {
  if (err) console.error(err.message);
  else {
    stmtProblem.finalize();
    stmtTestCase.finalize();
    console.log('\n--- Matrix Configuration Complete. Database Locked & Loaded. ---');
  }
});