import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

const CODE_TEMPLATES = {
  python: `# Write your Python solution here\n\ndef solve():\n    pass\n\nif __name__ == '__main__':\n    solve()`,
  cpp: `// Write your C++ solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}`,
  java: `// Write your Java solution here\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // your code here\n    }\n}`
};

export default function ProblemWorkspace({ problemId, onBack }) {
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verdict, setVerdict] = useState(null);

  // Fetch specific problem data when problemId changes
  useEffect(() => {
    setLoading(true);
    setVerdict(null);
    fetch(`http://localhost:5000/api/problems/${problemId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblem(data.problem);
          setCode(CODE_TEMPLATES[language]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching problem:", err);
        setLoading(false);
      });
  }, [problemId]);

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(CODE_TEMPLATES[selectedLang]);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setVerdict(null);
    try {
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId, language, code }),
      });
      const data = await response.json();
      setVerdict(data.message || "Code submitted successfully!");
    } catch (error) {
      setVerdict("Error connecting to judge server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ background: '#18181b', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading problem...</div>;
  }

  if (!problem) {
    return <div style={{ background: '#18181b', color: '#fff', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Problem not found.</div>;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#18181b', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Left Pane: Problem Description */}
      <div style={{ width: '50%', padding: '24px', borderRight: '1px solid #3f3f46', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', overflowY: 'auto' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginBottom: '16px', fontSize: '14px' }}>← Back to Problems</button>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>{problem.title}</h1>
          <p style={{ color: '#d4d4d8', marginBottom: '24px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{problem.description}</p>
          
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Example:</h3>
          <div style={{ backgroundColor: '#27272a', padding: '16px', borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px', border: '1px solid #3f3f46', marginBottom: '16px' }}>
            <span style={{ color: '#a1a1aa' }}>Input:</span> {problem.input_example} <br />
            <span style={{ color: '#a1a1aa' }}>Output:</span> {problem.output_example}
          </div>
        </div>
        
        {verdict && (
          <div style={{ marginTop: '16px', padding: '16px', borderRadius: '6px', backgroundColor: '#27272a', border: '1px solid #3f3f46', fontFamily: 'monospace' }}>
            <span style={{ color: '#eab308', fontWeight: 'bold' }}>Server Response:</span>
            <p style={{ marginTop: '4px', fontSize: '14px', color: '#d4d4d8' }}>{verdict}</p>
          </div>
        )}
      </div>

      {/* Right Pane: Code Editor */}
      <div style={{ width: '50%', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ height: '56px', borderBottom: '1px solid #3f3f46', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: '#202023' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ fontSize: '14px', fontWeight: '500', color: '#a1a1aa' }}>Language:</label>
            <select value={language} onChange={handleLanguageChange} style={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: '4px', padding: '4px 12px', fontSize: '14px', color: '#fff' }}>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
              <option value="java">Java (OpenJDK)</option>
            </select>
          </div>
          <button onClick={handleSubmit} disabled={isSubmitting} style={{ padding: '6px 20px', borderRadius: '4px', fontSize: '14px', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', backgroundColor: isSubmitting ? '#52525b' : '#16a34a', color: '#fff' }}>
            {isSubmitting ? 'Running...' : 'Submit Code'}
          </button>
        </div>

        <div style={{ flex: 1, backgroundColor: '#09090b', paddingTop: '8px' }}>
          <Editor height="100%" theme="vs-dark" language={language === 'cpp' ? 'cpp' : language} value={code} onChange={(value) => setCode(value || '')} options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }} />
        </div>
      </div>
    </div>
  );
}