import React, { useState, useEffect } from 'react';
import ProblemWorkspace from './ProblemWorkspace';

function App() {
  const [problems, setProblems] = useState([]);
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the list of problems from Express when dashboard mounts
  useEffect(() => {
    fetch('http://localhost:5000/api/problems')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProblems(data.problems);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching problems list:", err);
        setLoading(false);
      });
  }, []);

  // If a problem is clicked, show the workspace for that problem
  if (selectedProblemId) {
    return (
      <ProblemWorkspace 
        problemId={selectedProblemId} 
        onBack={() => setSelectedProblemId(null)} 
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#111827', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>LeetCode Clone Dashboard</h1>
        <p style={{ color: '#9ca3af', marginBottom: '32px' }}>Select a problem from your SQLite database below to begin coding.</p>

        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading problems dashboard...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {problems.map((prob, index) => (
              <div 
                key={prob.id}
                onClick={() => setSelectedProblemId(prob.id)}
                style={{
                  backgroundColor: '#1f2937',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #374151',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background-color 0.2s, transform 0.1s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#374151'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
              >
                <span style={{ fontSize: '18px', fontWeight: '600' }}>
                  {index + 1}. {prob.title}
                </span>
                <span style={{ color: '#3b82f6', fontSize: '14px', fontWeight: '500' }}>Solve Problem →</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;