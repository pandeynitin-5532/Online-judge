import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProblemWorkspace from './ProblemWorkspace';
import Leaderboard from './Leaderboard';
import AuthModal from './AuthModal'; 

// Dynamically toggles between live cloud container or local backend shell
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ProblemDashboard({ user, onLogout }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/problems`)
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

  const getDifficultyBadge = (index) => {
    if (index % 3 === 0) {
      return (
        <span className="text-[9px] font-mono font-black px-2.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.05)] tracking-widest uppercase">
          EASY
        </span>
      );
    }
    if (index % 3 === 1) {
      return (
        <span className="text-[9px] font-mono font-black px-2.5 py-0.5 rounded border border-amber-500/20 bg-amber-500/5 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.05)] tracking-widest uppercase">
          MEDIUM
        </span>
      );
    }
    return (
      <span className="text-[9px] font-mono font-black px-2.5 py-0.5 rounded border border-rose-500/20 bg-rose-500/5 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.05)] tracking-widest uppercase">
        HARD
      </span>
    );
  };

  return (
    <div className="relative min-h-screen w-screen bg-[#030307] text-zinc-100 p-8 md:p-12 font-sans antialiased overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="absolute inset-0 bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.12] pointer-events-none" />
      <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[5%] w-[550px] h-[550px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-6 mb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-2 h-5 bg-cyan-500 rounded-sm inline-block shadow-[0_0_10px_#22d3ee]" />
              <h1 className="text-xl font-black tracking-[0.2em] text-white font-mono uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
                CODEMATRIX_MAIN_FRAME
              </h1>
            </div>
            <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
              PROBING SYSTEM MODULE LAYERS // PARSING DOCK DATA ROWS FROM CLOUD POSTGRESQL BACKEND
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/leaderboard')}
              className="text-[10px] font-mono font-black tracking-widest bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-400 px-4 py-2 border border-cyan-500/20 rounded-xl transition-all duration-200 uppercase shadow-[0_0_15px_rgba(34,211,238,0.02)]"
            >
              RANK_BOARD ↗
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-zinc-600 font-mono text-xs animate-pulse tracking-wider">INITIALIZING SECURE SOCKET COMPILATION SCAN...</div>
        ) : problems.length === 0 ? (
          <div className="text-zinc-600 font-mono text-xs italic tracking-wider">CRITICAL: ZERO RESPONSE DATA RETURNED FROM CLUSTER NODE.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {problems.map((prob, index) => (
              <div 
                key={prob.id}
                onClick={() => navigate(`/problem/${prob.id}`)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between bg-[#090911]/50 backdrop-blur-xl border border-zinc-900/80 p-4 rounded-xl cursor-pointer transition-all duration-300 hover:border-zinc-800/80 hover:bg-[#0b0b14] active:scale-[0.995] hover:shadow-[0_0_25px_rgba(34,211,238,0.02)]"
              >
                <div className="flex items-center gap-4 mb-2 sm:mb-0">
                  <span className="text-[10px] font-mono font-black text-zinc-700 group-hover:text-cyan-400 transition-colors duration-300 min-w-[24px]">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <h3 className="text-xs font-bold tracking-wide text-zinc-300 group-hover:text-white transition-colors duration-300 font-sans">
                    {prob.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 border-t border-zinc-900/40 sm:border-t-0 pt-2 sm:pt-0">
                  {getDifficultyBadge(index)}
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black tracking-[0.15em] text-zinc-600 group-hover:text-cyan-400 transition-all duration-300 uppercase">
                      RUN_SANDBOX
                    </span>
                    <span className="text-zinc-700 group-hover:text-cyan-400 transition-all duration-300 transform group-hover:translate-x-1 font-mono text-xs">
                      &rarr;
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 flex justify-between items-center text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest border-t border-zinc-900/60 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse" />
              <span>OPERATOR: <span className="text-cyan-400">{user?.nickname || 'CONNECTED'}</span></span>
            </div>
            <button 
  onClick={onLogout}
  className="text-rose-500/60 hover:text-rose-400 transition-colors cursor-pointer border border-rose-500/10 bg-rose-500/5 px-2 py-0.5 rounded"
>
  TERMINATE_SESSION
</button>
          </div>
          <span>LOADED_CHALLENGES: {problems.length}</span>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('oj_token');
    const savedUser = localStorage.getItem('oj_user');
    
    if (token && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      setIsAuthOpen(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('oj_token');
    localStorage.removeItem('oj_user');
    setCurrentUser(null);
    setIsAuthOpen(true);
  };

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<ProblemDashboard user={currentUser} onLogout={handleLogout} />} />
          <Route path="/problem/:id" element={<ProblemWorkspace />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onAuthSuccess={(user) => setCurrentUser(user)} 
      />
    </>
  );
}