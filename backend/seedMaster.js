const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const masterMatrix = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
    input_example: '[2,7,11,15]\n9',
    output_example: '[0,1]',
    template_python: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        pass',
    template_cpp: '#include <vector>\n\nclass Solution {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'twoSum',
      returnType: 'list_int',
      args: [{ name: 'nums', type: 'list_int' }, { name: 'target', type: 'int' }]
    }),
    test_cases: [
      { input_data: '[2,7,11,15]\n9', expected_output: '[0,1]' },
      { input_data: '[3,2,4]\n6', expected_output: '[1,2]' }
    ]
  },
  {
    id: 'palindrome-number',
    title: 'Palindrome Number',
    description: 'Given an integer x, return true if x is a palindrome, and false otherwise.',
    input_example: '121',
    output_example: 'true',
    template_python: 'class Solution:\n    def isPalindrome(self, x: int) -> bool:\n        pass',
    template_cpp: 'class Solution {\npublic:\n    bool isPalindrome(int x) {\n        \n    }\n};',
    template_java: 'import java.util.*;\n\nclass Solution {\n    public boolean isPalindrome(int x) {\n        \n    }\n}',
    metadata_json: JSON.stringify({
      functionName: 'isPalindrome',
      returnType: 'bool',
      args: [{ name: 'x', type: 'int' }]
    }),
    test_cases: [
      { input_data: '121', expected_output: 'true' },
      { input_data: '-121', expected_output: 'false' },
      { input_data: '10', expected_output: 'false' }
    ]
  },
  {
    id: 'fizz-buzz',
    title: 'Fizz Buzz',
    description: 'Given an integer n, return a string array answer (1-indexed) where:\n- answer[i] == "Fizz" if i is divisible by 3.\n- answer[i] == "Buzz" if i is divisible by 5.\n- answer[i] == "FizzBuzz" if i is divisible by 3 and 5.\n- answer[i] == i (as a string) if none match.',
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
      { input_data: '["h","e","l","l","o"]', expected_output: '["o","l","l","e","h"]' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
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
      { input_data: '[1,2,4]\n[1,3,4]', expected_output: '[1,1,2,3,4,4]' }
    ]
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray',
    description: 'Given an integer array nums, find the contiguous subarray which has the largest sum and return its sum.',
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
      { input_data: '[-2,1,-3,4,-1,2,1,-5,4]', expected_output: '6' }
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
      { input_data: '"anagram"\n"nagaram"', expected_output: 'true' }
    ]
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    description: 'Given an array of integers nums sorted in ascending order and a target, return target index or -1.',
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
    description: 'How many distinct ways can you climb to the top of a staircase of n steps taking 1 or 2 steps at a time?',
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
      { input_data: '2', expected_output: '2' }
    ]
  }
];

db.serialize(() => {
  console.log('--- PURGING OLD RECORDS & RE-SEEDING 10-PROBLEM MATRIX ---');

  // Hard clear to fix any foreign key fragmentation
  db.run("DELETE FROM test_cases");
  db.run("DELETE FROM problems");

  const stmtProblem = db.prepare(`
    INSERT INTO problems (id, title, description, input_example, output_example, template_python, template_cpp, template_java, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtTestCase = db.prepare(`
    INSERT INTO test_cases (problem_id, input_data, expected_output)
    VALUES (?, ?, ?)
  `);

  masterMatrix.forEach((p) => {
    stmtProblem.run(p.id, p.title, p.description, p.input_example, p.output_example, p.template_python, p.template_cpp, p.template_java, p.metadata_json, (err) => {
      if (err) console.error(`❌ Error inserting problem row ${p.id}:`, err.message);
      else console.log(`[Success] Registered Index Segment: ${p.title}`);
    });

    p.test_cases.forEach((tc) => {
      stmtTestCase.run(p.id, tc.input_data, tc.expected_output);
    });
  });

  stmtProblem.finalize();
  stmtTestCase.finalize();
});

db.close((err) => {
  if (err) console.error(err.message);
  else console.log('\n🚀 ALL 10 PROBLEMS AND CORES SECURELY MOUNTED TO SQLITE DISK!');
});