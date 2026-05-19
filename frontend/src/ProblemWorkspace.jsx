import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProblemWorkspace() {
  // --- UPDATED HERE: Extract ID dynamically from the route pattern url ---
  const { id: problemId } = useParams();
  const navigate = useNavigate();
  
  // Navigation State to toggle left panel view
  const [activeTab, setActiveTab] = useState('description'); // 'description' or 'submissions'
  
  // Data States
  const [problem, setProblem] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [codeValue, setCodeValue] = useState('// Write your code here\n');
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  // UI Processing States (Submission-specific)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Leave EVERYTHING else below this point exactly as it was!

  // --- NEW: Custom Testing Playground States ---
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [runResult, setRunResult] = useState(null); // stores { status, stdout, stderr, compile_error }

  // 1. Load Problem details on component mount
  useEffect(() => {
    fetch(`http://localhost:5000/api/problems/${problemId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblem(data.problem);
          // Seed custom testing playground with the example input
          if (data.problem.input_example) {
            setCustomInput(data.problem.input_example);
          }
          // Initial template seed for the default language (python)
          if (data.problem.template_python) {
            setCodeValue(data.problem.template_python);
          }
        }
      })
      .catch((err) => console.error("Error fetching problem info:", err));
  }, [problemId]);

  // 2. Dynamic Template Reloader: Syncs editor code when the dropdown language changes
  useEffect(() => {
    if (!problem) return;

    if (selectedLanguage === 'python' && problem.template_python) {
      setCodeValue(problem.template_python);
    } else if (selectedLanguage === 'cpp' && problem.template_cpp) {
      setCodeValue(problem.template_cpp);
    } else if (selectedLanguage === 'java' && problem.template_java) {
      setCodeValue(problem.template_java);
    } else {
      setCodeValue('// Write your code here\n');
    }
  }, [selectedLanguage, problem]);

  // 3. Helper function to fetch the submission history records
  const fetchHistory = () => {
    setIsLoadingHistory(true);
    fetch(`http://localhost:5000/api/problems/${problemId}/submissions`)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setSubmissionsList(data);
        } else if (data && data.success && Array.isArray(data.submissions)) {
          setSubmissionsList(data.submissions);
        } else {
          setSubmissionsList([]);
        }
        setIsLoadingHistory(false);
      })
      .catch((err) => {
        console.error("Error fetching submission details:", err);
        setIsLoadingHistory(false);
      });
  };

  // 4. Fetch history background data initially on mount to populate the navigation badge counter
  useEffect(() => {
    if (problemId) {
      fetchHistory();
    }
  }, [problemId]);

  // 5. Automatically fetch fresh history rows whenever user shifts to the Submissions tab
  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchHistory();
    }
  }, [activeTab]);

  // 6. Fire the payload to your backend POST endpoint
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setCurrentVerdict("Running test cases...");

    try {
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problemId,
          language: selectedLanguage,
          code: codeValue
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setCurrentVerdict(data.verdict);
        fetchHistory();
      } else {
        setCurrentVerdict(data.message || "Execution Failed.");
      }
    } catch (err) {
      console.error("Network error during code submission:", err);
      setCurrentVerdict("Error reaching compilation server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- NEW: Handle Run Code (Ephemeral Testing execution) ---
  const handleRunCode = async () => {
    setIsRunningCode(true);
    setIsConsoleOpen(true); // Auto-expand drawer so user sees output progression
    setRunResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/run-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemId: problemId,
          language: selectedLanguage,
          code: codeValue,
          customInput: customInput
        })
      });

      const data = await response.json();
      setRunResult(data);
    } catch (err) {
      console.error("Network error during code sandbox execution:", err);
      setRunResult({
        status: "Runtime Error",
        stderr: "Failed to establish communication link with execution server."
      });
    } finally {
      setIsRunningCode(false);
    }
  };

  return (
    <div className="grid grid-cols-2 h-screen w-screen bg-zinc-900 text-zinc-100 overflow-hidden font-sans">
      
      {/* LEFT PANEL: DESCRIPTION AND SUBMISSIONS HISTORY TABBED AREA */}
      <div className="flex flex-col border-r border-zinc-700 h-full overflow-hidden">
        
        {/* Navigation Tab Bar */}
        <div className="flex bg-zinc-800 border-b border-zinc-700 select-none">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'description'
                ? 'bg-zinc-900 text-blue-400 border-b-2 border-blue-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'submissions'
                ? 'bg-zinc-900 text-blue-400 border-b-2 border-blue-500'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Submissions ({submissionsList.length})
          </button>
        </div>

        {/* Dynamic Tab Panels */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === 'description' ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-white">{problem?.title || "Loading Problem..."}</h1>
              <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{problem?.description}</p>
              
              {problem?.input_example && (
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs">
                  <span className="text-zinc-500 block mb-1 font-bold">Example Input:</span>
                  <pre className="text-zinc-300 whitespace-pre-wrap">{problem.input_example}</pre>
                </div>
              )}
              {problem?.output_example && (
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs">
                  <span className="text-zinc-500 block mb-1 font-bold">Example Output:</span>
                  <pre className="text-zinc-300 whitespace-pre-wrap">{problem.output_example}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-white">Your Past Attempts</h3>
                <button 
                  onClick={fetchHistory} 
                  className="text-xs text-zinc-400 bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-2 py-1 rounded"
                >
                  Refresh
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="text-zinc-500 text-sm animate-pulse">Querying database records...</div>
              ) : submissionsList.length === 0 ? (
                <div className="text-zinc-500 text-sm italic">You haven't submitted any runs for this problem yet.</div>
              ) : (
                <div className="space-y-2">
                  {submissionsList.map((row) => {
                    const verdictStr = row.verdict || "";
                    const isPassed = verdictStr.includes("AC") || verdictStr.toLowerCase().includes("accepted");
                    const isTle = verdictStr.includes("TLE") || verdictStr.includes("Time Limit");

                    let verdictColor = "text-red-400";
                    if (isPassed) verdictColor = "text-green-400";
                    else if (isTle) verdictColor = "text-amber-500";

                    return (
                      <div 
                        key={row.id} 
                        className="bg-zinc-800/60 border border-zinc-700 p-4 rounded-xl flex items-center justify-between transition-all hover:border-zinc-600"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${verdictColor}`}>
                              {row.verdict || "Evaluated"}
                            </span>
                            <span className="text-[10px] bg-zinc-700 px-2 py-0.5 rounded font-mono uppercase tracking-wider text-zinc-300">
                              {row.language}
                            </span>
                          </div>
                          <span className="text-[11px] text-zinc-500 block mt-1">
                            {row.submitted_at ? new Date(row.submitted_at).toLocaleString() : "Just now"}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedLanguage(row.language);
                            setTimeout(() => setCodeValue(row.code), 10);
                          }}
                          className="text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Restore Code
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL: MONACO EDITOR, COLLAPSIBLE TESTING DRAWER, AND ACTION FOOTER BAR */}
      <div className="flex flex-col h-full bg-zinc-950 overflow-hidden relative">
        
        {/* Workspace Toolbar Options */}
        <div className="flex justify-between items-center px-4 bg-zinc-900 border-b border-zinc-700 h-[45px]">
          <span className="text-xs font-mono font-bold text-zinc-400">Workspace Sandbox</span>
          <select 
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-zinc-800 text-zinc-200 text-xs border border-zinc-700 rounded px-2 py-1 outline-none cursor-pointer focus:border-blue-500"
          >
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
        </div>

        {/* Monaco Editor Frame */}
        <div className="flex-1 w-full bg-zinc-950">
          <Editor
            height="100%"
            theme="vs-dark"
            language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage}
            value={codeValue}
            onChange={(val) => setCodeValue(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              automaticLayout: true,
              fontFamily: "Fira Code, Menlo, Monaco, Consolas, monospace"
            }}
          />
        </div>

        {/* --- NEW: Interactive Collapsible Test Playground Drawer --- */}
        <div 
          className={`absolute left-0 right-0 bg-zinc-900 border-t border-zinc-700 transition-all duration-200 ease-in-out z-10 flex flex-col ${
            isConsoleOpen ? 'bottom-[110px] h-[280px]' : 'bottom-[110px] h-0 overflow-hidden border-t-0'
          }`}
        >
          {/* Drawer Title Bar */}
          <div className="flex bg-zinc-950 px-4 py-2 border-b border-zinc-800 justify-between items-center text-[11px] font-bold text-zinc-400 uppercase font-mono tracking-wider">
            <span>Testcase Playground Terminal</span>
            <button 
              onClick={() => setIsConsoleOpen(false)} 
              className="hover:text-zinc-100 text-lg font-bold leading-none"
            >
              &times;
            </button>
          </div>
          
          {/* Split Inputs and Outputs layout */}
          <div className="flex flex-1 overflow-hidden p-4 gap-4 bg-zinc-900/40">
            {/* Custom Input Column */}
            <div className="w-1/2 flex flex-col">
              <label className="text-[10px] font-bold text-zinc-500 uppercase font-mono mb-1.5 tracking-wide">
                Custom Input (stdin)
              </label>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                className="w-full flex-1 p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none leading-relaxed"
                placeholder="Provide standard inputs matched to system dimensions..."
              />
            </div>

            {/* Terminal Monitor Column */}
            <div className="w-1/2 flex flex-col bg-zinc-950 border border-zinc-800 rounded-lg p-3 overflow-y-auto font-mono text-xs">
              <span className="text-[10px] font-bold text-zinc-500 uppercase font-mono mb-2 tracking-wide block">
                Output Stream
              </span>
              
              {isRunningCode && (
                <div className="text-amber-400 animate-pulse font-mono text-xs">
                  Spawning secure process sandbox wrapper...
                </div>
              )}
              
              {!isRunningCode && runResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
                    <span className="text-zinc-500 text-[11px]">Result Verdict:</span>
                    <span className={`font-bold uppercase tracking-wide text-xs ${
                      runResult.status === 'Success' ? 'text-green-400' : 'text-rose-400'
                    }`}>
                      {runResult.status}
                    </span>
                  </div>

                  {runResult.compile_error && (
                    <div>
                      <span className="text-rose-400 font-bold block mb-1 text-[11px]">Compilation Log:</span>
                      <pre className="text-rose-300 text-[11px] whitespace-pre-wrap bg-rose-950/20 p-2.5 border border-rose-900/30 rounded-md max-h-[140px] overflow-y-auto">
                        {runResult.compile_error}
                      </pre>
                    </div>
                  )}

                  {runResult.stdout !== undefined && !runResult.compile_error && (
                    <div>
                      <span className="text-zinc-500 block mb-1 text-[11px]">stdout:</span>
                      <pre className="text-zinc-200 bg-zinc-900 p-2 rounded border border-zinc-800 whitespace-pre-wrap max-h-[120px] overflow-y-auto">
                        {runResult.stdout || <span className="text-zinc-600 italic">No output captured</span>}
                      </pre>
                    </div>
                  )}

                  {runResult.stderr && (
                    <div>
                      <span className="text-rose-400 font-bold block mb-1 text-[11px]">stderr:</span>
                      <pre className="text-rose-300 bg-rose-950/10 p-2 rounded border border-rose-900/30 whitespace-pre-wrap">
                        {runResult.stderr}
                      </pre>
                    </div>
                  )}
                </div>
              )}
              {!isRunningCode && !runResult && (
                <div className="text-zinc-600 italic font-mono text-xs flex items-center h-full justify-center">
                  Hit "Run Code" to view volatile data streams without updating profile statistics.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Control and Submit Status panel */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-700 flex flex-col gap-3 min-h-[110px] z-20">
          {currentVerdict && (
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">Last Submission Status:</span>
              <span className="text-sm font-bold tracking-tight text-blue-400 font-mono">{currentVerdict}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center w-full mt-auto">
            {/* Console Expand Control Toggle Button */}
            <button
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition font-mono border border-zinc-800"
            >
              Console {isConsoleOpen ? '▼' : '▲'}
            </button>

            <div className="flex gap-2">
              {/* Custom Playground Run Trigger Button */}
              <button
                disabled={isRunningCode || isSubmitting}
                onClick={handleRunCode}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all border border-zinc-700 ${
                  isRunningCode || isSubmitting
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700 active:scale-95'
                }`}
              >
                {isRunningCode ? 'Running...' : 'Run Code'}
              </button>

              {/* Main DB Submission Trigger Button */}
              <button
                disabled={isSubmitting || isRunningCode}
                onClick={handleSubmitCode}
                className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md ${
                  isSubmitting || isRunningCode
                    ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
                }`}
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Code'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}