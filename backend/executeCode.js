const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Require the same sqlite instance to look up metadata strings on the fly
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.join(__dirname, 'database.db');

const outputPath = path.join(__dirname, 'codes');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}

/**
 * Runs a single generated binary/file instance against an individual string input with a strict timeout
 */
const runSingleTest = (commandLine, inputStr, timeoutMs = 2000) => {
    return new Promise((resolve) => {
        const args = commandLine.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
        const command = args.shift().replace(/['"]/g, '');
        const cleanArgs = args.map(arg => arg.replace(/['"]/g, ''));

        const child = spawn(command, cleanArgs);
        
        let stdout = '';
        let stderr = '';
        let isTimeout = false;

        const timer = setTimeout(() => {
            isTimeout = true;
            try {
                child.kill('SIGKILL'); 
            } catch (err) {
                console.error("Failed to kill process:", err);
            }
        }, timeoutMs);

        if (inputStr && child.stdin) {
            child.stdin.write(String(inputStr) + "\n");
            child.stdin.end();
        } else if (child.stdin) {
            child.stdin.end();
        }

        child.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        child.on('close', (code, signal) => {
            clearTimeout(timer);

            if (isTimeout || signal === 'SIGKILL' || signal === 'SIGTERM') {
                return resolve({ success: false, isTimeout: true, output: 'TLE' });
            }

            if (code !== 0) {
                return resolve({ success: false, isTimeout: false, output: stderr || `Exit code ${code}` });
            }

            resolve({ success: true, isTimeout: false, output: stdout.trim() });
        });

        child.on('error', (err) => {
            clearTimeout(timer);
            resolve({ success: false, isTimeout: false, output: err.message });
        });
    });
};

/**
 * Compiles code synchronously/separately so compilation time doesn't cause a false TLE
 */
const compileCode = (command) => {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                resolve({ success: false, error: stderr || error.message });
            } else {
                resolve({ success: true });
            }
        });
    });
};

/**
 * Executes code across ALL fetched test cases from your SQLite database
 */
const executeCode = async (language, code, testCases = []) => {
    if (!testCases || testCases.length === 0) {
        return "❌ Missing Test Cases Configuration";
    }

    const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const cleanId = uniqueId.replace(/-/g, '_'); // Java class names cannot contain hyphens
    
    let fileExtension = '';
    if (language === 'python') fileExtension = 'py';
    else if (language === 'cpp') fileExtension = 'cpp';
    else if (language === 'java') fileExtension = 'java';

    const filename = language === 'java' ? `Main_${cleanId}.java` : `${uniqueId}.${fileExtension}`;
    const filePath = path.join(outputPath, filename);

    let finalCodeToExecute = code;
    const activeProblemId = testCases[0].problem_id;

    const localDb = new sqlite3.Database(dbPath);
    const getMetadata = () => new Promise((res) => {
        localDb.get("SELECT metadata_json FROM problems WHERE id = ?", [activeProblemId], (err, row) => {
            res(row ? JSON.parse(row.metadata_json) : null);
        });
    });
    
    const meta = await getMetadata();
    localDb.close();

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

// SFINAE Template Setup to intercept vectors and format print arrays safely
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

    fs.writeFileSync(filePath, finalCodeToExecute);

    let runCommand = '';
    
    if (language === 'python') {
        runCommand = `python "${filePath}"`; 
    } 
    else if (language === 'cpp') {
        const exeBinaryPath = path.join(outputPath, `${uniqueId}.out`);
        const compileCommand = `g++ "${filePath}" -o "${exeBinaryPath}"`;
        
        const compilation = await compileCode(compileCommand);
        if (!compilation.success) {
            cleanUpFiles(language, filePath, uniqueId);
            return `❌ Compilation Error: ${compilation.error}`;
        }
        runCommand = `"${exeBinaryPath}"`;
    } 
    else if (language === 'java') {
        const compileCommand = `javac "${filePath}"`;
        
        const compilation = await compileCode(compileCommand);
        if (!compilation.success) {
            cleanUpFiles(language, filePath, uniqueId);
            return `❌ Compilation Error: ${compilation.error}`;
        }
        runCommand = `java -cp "${outputPath}" Main_${cleanId}`;
    }

    const isPlaygroundRun = testCases.length === 1 && testCases[0].expected_output === "";

    if (isPlaygroundRun) {
        const result = await runSingleTest(runCommand, testCases[0].input_data || '', 2000);
        cleanUpFiles(language, filePath, uniqueId);
        if (!result.success) {
            return `❌ ${result.output}`;
        }
        return result.output;
    }

    let verdict = "🎉 Accepted (AC)";

    for (let i = 0; i < testCases.length; i++) {
        const currentCase = testCases[i];
        const inputString = currentCase.input_data || '';
        
        const expectedString = (currentCase.expected_output || '')
            .replace(/['"\r\n\s]/g, '')
            .toLowerCase();

        const result = await runSingleTest(runCommand, inputString, 2000);

        if (!result.success) {
            if (result.isTimeout) {
                verdict = `⏱️ Time Limit Exceeded (TLE) on Test Case ${i + 1}`;
            } else {
                verdict = `❌ Runtime Error on Test Case ${i + 1}`;
            }
            break; 
        }

        const actualOutput = (result.output || '')
            .replace(/['"\r\n\s]/g, '')
            .toLowerCase();

        console.log(`[DEBUG COMPONENT] Matching Test Case ${i + 1}`);
        console.log(`   -> Expected Row: [${expectedString}] (Length: ${expectedString.length})`);
        console.log(`   -> Actual Output: [${actualOutput}] (Length: ${actualOutput.length})`);

        if (actualOutput !== expectedString) {
            verdict = `❌ Wrong Answer (WA) on Test Case ${i + 1}`;
            break; 
        }
    }

    cleanUpFiles(language, filePath, uniqueId);
    return verdict;
};

const cleanUpFiles = (language, filePath, uniqueId) => {
    try {
        const cleanId = uniqueId.replace(/-/g, '_');
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (language === 'cpp') {
            const exeBinaryPath = path.join(outputPath, `${uniqueId}.out`);
            if (fs.existsSync(exeBinaryPath)) fs.unlinkSync(exeBinaryPath);
        }
        if (language === 'java') {
            const classPath = path.join(outputPath, `Main_${cleanId}.class`);
            if (fs.existsSync(classPath)) fs.unlinkSync(classPath);
        }
    } catch (cleanupError) {
        console.error("Storage cleanup error:", cleanupError);
    }
};

module.exports = { executeCode };