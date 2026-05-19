import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProblemWorkspace from './ProblemWorkspace';

// 1. Dashboard Sub-Component (Extracted clean from your original App function)
function ProblemDashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook to change browser URLs smoothly

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
                onClick={() => navigate(`/problem/${prob.id}`)} // Refactored to drive routing pathways
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

// 2. Main App Router Wrapper Shell
function App() {
  return (
    <Router>
      <Routes>
        {/* Main Dashboard view */}
        <Route path="/" element={<ProblemDashboard />} />
        
        {/* Dynamic code evaluation workplace view mapping :id parameters */}
        <Route path="/problem/:id" element={<ProblemWorkspace />} />
        
        {/* Fallback structural route redirects wildcards cleanly back to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;