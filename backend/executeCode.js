const axios = require('axios');
const { query } = require('./db'); // Clean production migration to PostgreSQL pool wrapper

// Map system strings to Piston's explicit execution runtime configurations
const PISTON_LANG_MAP = {
    python: { language: 'python', version: '3.10.0', ext: 'py' },
    cpp: { language: 'cpp', version: '10.2.0', ext: 'cpp' },
    java: { language: 'java', version: '15.0.2', ext: 'java' }
};

/**
 * Runs a single code string execution using Piston's isolated cloud sandbox API
 */
const runSingleTestPiston = async (language, finalCode, inputStr, cleanJavaId) => {
    try {
        const langConfig = PISTON_LANG_MAP[language];
        const filename = language === 'java' ? `Main_${cleanJavaId}.java` : `solution.${langConfig.ext}`;

        const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
            language: langConfig.language,
            version: langConfig.version,
            files: [
                {
                    name: filename,
                    content: finalCode
                }
            ],
            stdin: inputStr || '',
            run_timeout: 2000 // 2-second strict time limit checkpoint
        });

        const run = response.data.run;

        // Trace for Time Limit Exceeded flags triggered from Piston signals
        if (run.signal === 'SIGKILL' || run.output?.includes('SIGKILL')) {
            return { success: false, isTimeout: true, output: 'TLE' };
        }

        // Catch non-zero exit signatures as errors
        if (run.code !== 0) {
            return { success: false, isTimeout: false, output: run.stderr || run.output || `Exit code ${run.code}` };
        }

        return { success: true, isTimeout: false, output: (run.stdout || '').trim() };

    } catch (err) {
        return { success: false, isTimeout: false, output: `Cloud Sandbox Routing Failure: ${err.message}` };
    }
};

/**
 * Executes code across ALL fetched test cases using Piston cloud engine infrastructure
 * Preserves 100% of your established driver architecture matrices safely
 */
const executeCode = async (language, code, testCases = []) => {
    if (!testCases || testCases.length === 0) {
        return { status: 'MISSING_TEST_CASES', runtime_ms: 0.0 };
    }

    const uniqueId = Date.now() + '_' + Math.round(Math.random() * 1E9);
    const cleanId = uniqueId.replace(/-/g, '_'); // Java class names cannot contain hyphens
    
    let finalCodeToExecute = code;
    const activeProblemId = testCases[0].problem_id;

    // Fetch problem metadata from the cloud PostgreSQL instance asynchronously
    const getMetadata = async () => {
        try {
            const result = await query("SELECT metadata_json FROM problems WHERE id = $1", [activeProblemId]);
            const row = result.rows[0];
            
            if (!row) return null;
            // PostgreSQL automatically parses JSONB types into objects, fallback to parse if it arrives as plain text
            return typeof row.metadata_json === 'string' ? JSON.parse(row.metadata_json) : row.metadata_json;
        } catch (err) {
            console.error("Error pulling metadata within judging thread:", err.message);
            return null;
        }
    };
    
    const meta = await getMetadata();

    if (meta && meta.functionName) {
        // --- 1. PYTHON DRIVER ASSEMBLY ---
        if (language === 'python') {
            const argTypeStrings = meta.args.map(a => `'${a.type}'`).join(', ');
            const pythonDriverStr = `
import sys
import ast

if __name__ == "__main__":
    raw_lines = sys.stdin.read().splitlines()
    parsed_args = []
    arg_types = [${argTypeStrings}]
    
    for i, type_str in enumerate(arg_types):
        if i >= len(raw_lines): break
        cleaned_line = raw_lines[i].strip()
        
        if type_str in ['list_int', 'list_str', 'char_list']:
            parsed_args.append(ast.literal_eval(cleaned_line))
        elif type_str == 'int':
            parsed_args.append(int(cleaned_line))
        elif type_str == 'bool':
            parsed_args.append(cleaned_line.lower() == 'true')
        else:
            if (cleaned_line.startswith("'") and cleaned_line.endswith("'")) or (cleaned_line.startswith('"') and cleaned_line.endswith('"')):
                parsed_args.append(ast.literal_eval(cleaned_line))
            else:
                parsed_args.append(cleaned_line)

    sol_instance = Solution()
    execution_ptr = getattr(sol_instance, "${meta.functionName}")
    output_result = execution_ptr(*parsed_args)
    
    if output_result is not None:
        if isinstance(output_result, bool):
            print(str(output_result).lower())
        else:
            print(output_result)
`;
            finalCodeToExecute = code + "\n" + pythonDriverStr;
        }

        // --- 2. C++ DRIVER ASSEMBLY ---
        else if (language === 'cpp') {
            let driverTop = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <type_traits>

std::vector<int> parseVectorInt(const std::string& input) {
    std::vector<int> res;
    std::string s = input;
    s.erase(std::remove(s.begin(), s.end(), '['), s.end());
    s.erase(std::remove(s.begin(), s.end(), ']'), s.end());
    std::replace(s.begin(), s.end(), ',', ' ');
    std::stringstream ss(s);
    int num;
    while(ss >> num) {
        res.push_back(num);
    }
    return res;
}

std::vector<std::string> parseVectorString(const std::string& input) {
    std::vector<std::string> res;
    std::string s = input;
    s.erase(std::remove(s.begin(), s.end(), '['), s.end());
    s.erase(std::remove(s.begin(), s.end(), ']'), s.end());
    std::stringstream ss(s);
    std::string token;
    while(std::getline(ss, token, ',')) {
        token.erase(std::remove(token.begin(), token.end(), '\\''), token.end());
        token.erase(std::remove(token.begin(), token.end(), '"'), token.end());
        token.erase(std::remove(token.begin(), token.end(), ' '), token.end());
        if(!token.empty()) res.push_back(token);
    }
    return res;
}

template <typename T>
typename std::enable_if<std::is_same<T, std::vector<std::string>>::value || std::is_same<T, std::vector<int>>::value, void>::type
printResult(const T& val) {
    std::cout << "[";
    for(size_t i=0; i<val.size(); ++i) {
        std::cout << val[i] << (i+1 == val.size() ? "" : ",");
    }
    std::cout << "]" << std::endl;
}

template <typename T>
typename std::enable_if<!std::is_same<T, std::vector<std::string>>::value && !std::is_same<T, std::vector<int>>::value, void>::type
printResult(const T& val) {
    std::cout << val << std::endl;
}
`;
            let mainBody = `\nint main() {\n    std::string line;\n`;
            let callArgs = [];

            meta.args.forEach((arg, index) => {
                mainBody += `    if(!std::getline(std::cin, line)) { line = ""; }\n`;
                if (arg.type !== 'list_int' && arg.type !== 'list_str' && arg.type !== 'char_list') {
                    mainBody += `    line.erase(std::remove(line.begin(), line.end(), '"'), line.end());\n`;
                    mainBody += `    line.erase(std::remove(line.begin(), line.end(), '\\''), line.end());\n`;
                }

                if (arg.type === 'list_int') {
                    mainBody += `    std::vector<int> arg_${index} = parseVectorInt(line);\n`;
                } else if (arg.type === 'list_str' || arg.type === 'char_list') {
                    mainBody += `    std::vector<std::string> arg_${index} = parseVectorString(line);\n`;
                } else if (arg.type === 'int') {
                    mainBody += `    int arg_${index} = line.empty() ? 0 : std::stoi(line);\n`;
                } else if (arg.type === 'bool') {
                    mainBody += `    bool arg_${index} = (line == "true" || line == "1");\n`;
                } else {
                    mainBody += `    std::string arg_${index} = line;\n`;
                }
                callArgs.push(`arg_${index}`);
            });

            mainBody += `    Solution sol;\n`;
            
            if (meta.returnType === 'void') {
                mainBody += `    sol.${meta.functionName}(${callArgs.join(', ')});\n    std::cout << "void" << std::endl;\n`;
            } else if (meta.returnType === 'bool') {
                mainBody += `    std::cout << (sol.${meta.functionName}(${callArgs.join(', ')}) ? "true" : "false") << std::endl;\n`;
            } else {
                mainBody += `    printResult(sol.${meta.functionName}(${callArgs.join(', ')}));\n`;
            }
            mainBody += `    return 0;\n}`;
            
            finalCodeToExecute = driverTop + "\n" + code + "\n" + mainBody;
        }

        // --- 3. JAVA DRIVER ASSEMBLY ---
        else if (language === 'java') {
            let javaDriverStr = `
public class Main_${cleanId} {
    private static int[] parseArrInt(String s) {
        s = s.replace("[", "").replace("]", "").trim();
        if (s.isEmpty()) return new int[0];
        String[] parts = s.split(",");
        int[] res = new int[parts.length];
        for(int i=0; i<parts.length; i++) res[i] = Integer.parseInt(parts[i].trim());
        return res;
    }

    private static String[] parseArrString(String s) {
        s = s.replace("[", "").replace("]", "").trim();
        if (s.isEmpty()) return new String[0];
        String[] parts = s.split(",");
        for(int i=0; i<parts.length; i++) {
            parts[i] = parts[i].trim().replaceAll("^['\\"]|['\\"]$", "");
        }
        return parts;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
`;
            let callArgs = [];
            meta.args.forEach((arg, index) => {
                javaDriverStr += `        if(!sc.hasNextLine()) return;\n        String line_${index} = sc.nextLine().trim();\n`;
                
                if (arg.type !== 'list_int' && arg.type !== 'list_str' && arg.type !== 'char_list') {
                    javaDriverStr += `        line_${index} = line_${index}.replace("\\"", "").replace("'", "");\n`;
                }

                if (arg.type === 'list_int') {
                    javaDriverStr += `        int[] arg_${index} = parseArrInt(line_${index});\n`;
                } else if (arg.type === 'list_str' || arg.type === 'char_list') {
                    javaDriverStr += `        String[] arg_${index} = parseArrString(line_${index});\n`;
                } else if (arg.type === 'int') {
                    javaDriverStr += `        int arg_${index} = Integer.parseInt(line_${index});\n`;
                } else if (arg.type === 'bool') {
                    javaDriverStr += `        boolean arg_${index} = line_${index}.equalsIgnoreCase("true") || line_${index}.equals("1");\n`;
                } else {
                    javaDriverStr += `        String arg_${index} = line_${index};\n`;
                }
                callArgs.push(`arg_${index}`);
            });

            javaDriverStr += `        Solution sol = new Solution();\n`;

            if (meta.returnType === 'list_int') {
                javaDriverStr += `        int[] r = sol.${meta.functionName}(${callArgs.join(', ')});\n`;
                javaDriverStr += `        System.out.println(Arrays.toString(r).replace(" ", ""));\n`;
            } else if (meta.returnType === 'list_str' || meta.returnType === 'char_list') {
                javaDriverStr += `        String[] r = sol.${meta.functionName}(${callArgs.join(', ')});\n`;
                javaDriverStr += `        System.out.println(Arrays.toString(r).replace(" ", ""));\n`;
            } else if (meta.returnType === 'bool') {
                javaDriverStr += `        System.out.println(String.valueOf(sol.${meta.functionName}(${callArgs.join(', ')})).toLowerCase());\n`;
            } else if (meta.returnType === 'int' || meta.returnType === 'str') {
                javaDriverStr += `        System.out.println(sol.${meta.functionName}(${callArgs.join(', ')}));\n`;
            } else {
                javaDriverStr += `        sol.${meta.functionName}(${callArgs.join(', ')});\n        System.out.println("void");\n`;
            }
            javaDriverStr += `    }\n}\n`;
            
            finalCodeToExecute = "import java.util.*;\n" + code + "\n" + javaDriverStr;
        }
    }

    const isPlaygroundRun = testCases.length === 1 && testCases[0].expected_output === "";

    // --- PLAYGROUND RUN PATHWAYS ---
    if (isPlaygroundRun) {
        const startClock = process.hrtime.bigint();
        const result = await runSingleTestPiston(language, finalCodeToExecute, testCases[0].input_data || '', cleanId);
        const endClock = process.hrtime.bigint();
        
        const elapsedMs = Number(endClock - startClock) / 1000000.0;

        if (!result.success) {
            return { status: result.isTimeout ? 'TLE' : 'COMPILE_ERROR', stdout: result.output, runtime_ms: elapsedMs };
        }
        return { status: 'ACCEPTED', stdout: result.output, runtime_ms: elapsedMs };
    }

    // --- OFFICIAL TEST CASING SUBMISSIONS RUNS ---
    let statusVerdict = "ACCEPTED";
    let cumulativeClockNs = BigInt(0);
    let consolidatedStdout = "";

    for (let i = 0; i < testCases.length; i++) {
        const currentCase = testCases[i];
        const inputString = currentCase.input_data || '';
        
        const expectedString = (currentCase.expected_output || '')
            .replace(/['"\r\n\s]/g, '')
            .toLowerCase();

        const startClock = process.hrtime.bigint();
        const result = await runSingleTestPiston(language, finalCodeToExecute, inputString, cleanId);
        const endClock = process.hrtime.bigint();

        cumulativeClockNs += (endClock - startClock);
        consolidatedStdout += `Test Case ${i + 1}:\n${result.output}\n\n`;

        if (!result.success) {
            statusVerdict = result.isTimeout ? "TLE" : "RUNTIME_ERROR";
            break; 
        }

        const actualOutput = (result.output || '')
            .replace(/['"\r\n\s]/g, '')
            .toLowerCase();

        if (actualOutput !== expectedString) {
            statusVerdict = "WRONG_ANSWER";
            break; 
        }
    }
    
    const finalElapsedMs = Number(cumulativeClockNs) / 1000000.0;

    return {
        status: statusVerdict,
        stdout: consolidatedStdout,
        runtime_ms: parseFloat(finalElapsedMs.toFixed(3))
    };
};

module.exports = { executeCode };