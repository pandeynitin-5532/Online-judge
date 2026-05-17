import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

export default function ProblemWorkspace({ problemId }) {
  // Navigation State to toggle left panel view
  const [activeTab, setActiveTab] = useState('description'); // 'description' or 'submissions'
  
  // Data States
  const [problem, setProblem] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [codeValue, setCodeValue] = useState('// Write your code here\n');
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  // UI Processing States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentVerdict, setCurrentVerdict] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 1. Load Problem details on component mount
  useEffect(() => {
    fetch(`/api/problems/${problemId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblem(data.problem);
        }
      })
      .catch((err) => console.error("Error fetching problem info:", err));
  }, [problemId]);

  // 2. Helper function to fetch the submission history records
  const fetchHistory = () => {
    setIsLoadingHistory(true);
    fetch(`/api/problems/${problemId}/submissions`)
      .then((res) => res.json())
      .then((data) => {
        setSubmissionsList(Array.isArray(data) ? data : []);
        setIsLoadingHistory(false);
      })
      .catch((err) => {
        console.error("Error fetching submission details:", err);
        setIsLoadingHistory(false);
      });
  };

  // 3. Automatically fetch fresh history rows whenever user shifts to the Submissions tab
  useEffect(() => {
    if (activeTab === 'submissions') {
      fetchHistory();
    }
  }, [activeTab]);

  // 4. Fire the payload to your backend POST endpoint
  const handleSubmitCode = async () => {
    setIsSubmitting(true);
    setCurrentVerdict("Running test cases...");

    try {
      const response = await fetch('/api/submissions', {
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
        // Refresh history automatically if the user is looking at the history tab
        if (activeTab === 'submissions') {
          fetchHistory();
        }
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
                  <span className="text-zinc-300">{problem.input_example}</span>
                </div>
              )}
              {problem?.output_example && (
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 font-mono text-xs">
                  <span className="text-zinc-500 block mb-1 font-bold">Example Output:</span>
                  <span className="text-zinc-300">{problem.output_example}</span>
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
                    const isPassed = row.verdict && (row.verdict.includes("AC") || row.verdict.toLowerCase().includes("accepted"));
                    return (
                      <div 
                        key={row.id} 
                        className="bg-zinc-800/60 border border-zinc-700 p-4 rounded-xl flex items-center justify-between transition-all hover:border-zinc-600"
                      >
                        <div>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${isPassed ? 'text-green-400' : 'text-red-400'}`}>
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
                          onClick={() => setCodeValue(row.code)}
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

      {/* RIGHT PANEL: MONACO EDITOR AND ACTION FOOTER BAR */}
      <div className="flex flex-col h-full bg-zinc-950 overflow-hidden">
        
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

        {/* Submit Control panel */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-700 flex flex-col gap-3 min-h-[110px]">
          {currentVerdict && (
            <div className="p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-between">
              <span className="text-xs text-zinc-400 font-mono">Last Run Status:</span>
              <span className="text-sm font-bold tracking-tight">{currentVerdict}</span>
            </div>
          )}
          
          <div className="flex justify-end gap-2 ml-auto">
            <button
              disabled={isSubmitting}
              onClick={handleSubmitCode}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-md ${
                isSubmitting 
                  ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95'
              }`}
            >
              {isSubmitting ? 'Evaluating Code...' : 'Submit Code'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}