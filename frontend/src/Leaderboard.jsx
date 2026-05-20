import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hard-mounted to your active host machine network IP address slot
const API_BASE_URL = ' https://sasquatch-acrobat-divinely.ngrok-free.dev';

export default function Leaderboard() {
  const [ranks, setRanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setRanks(data.leaderboard);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error patching score tracking rows:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen w-screen bg-[#0a0b10] text-zinc-300 font-sans p-6 md:p-12 overflow-x-hidden antialiased select-none">
      <div className="max-w-4xl mx-auto w-full relative z-10 animate-fadeIn">
        
        {/* Navigation Core Panel Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-5 mb-8">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
            <h1 className="text-sm font-mono font-black tracking-[0.2em] text-zinc-100 uppercase">
              CODEMATRIX // COMPETITIVE_LEADERBOARD
            </h1>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-mono font-black tracking-widest bg-zinc-950 px-3 py-1.5 border border-zinc-900 rounded-lg text-zinc-500 hover:text-zinc-300 transition duration-150 uppercase"
          >
            &lsaquo; RETURN_DOCK
          </button>
        </div>

        {loading ? (
          <div className="text-zinc-600 font-mono text-xs animate-pulse tracking-wider">COMPILING SCORING INDICES...</div>
        ) : ranks.length === 0 ? (
          <div className="text-zinc-600 font-mono text-xs italic tracking-wider">NO COMPUTED USER METRICS LOGGED IN RELATION MATRIX.</div>
        ) : (
          <div className="flex flex-col gap-2">
            
            {/* Table Header Layout */}
            <div className="flex items-center justify-between px-4 py-2 text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest">
              <div className="flex items-center gap-4">
                <span className="w-8">RANK</span>
                <span>COMPETITOR_HANDLE</span>
              </div>
              <div className="flex gap-12 text-right">
                <span className="w-16">SOLVED</span>
                <span className="w-16">ATTEMPTS</span>
                <span className="w-24 text-right">MEAN_CLOCK</span>
              </div>
            </div>

            {/* Rank List Map Render */}
            {ranks.map((user, index) => (
              <div 
                key={user.handle}
                className="flex items-center justify-between bg-[#0e1017]/80 backdrop-blur-xl border border-zinc-900 p-4 rounded-xl hover:border-zinc-800 transition duration-150"
              >
                <div className="flex items-center gap-4">
                  <span className={`font-mono text-xs font-black min-w-[32px] ${index === 0 ? 'text-cyan-400' : 'text-zinc-600'}`}>
                    #{String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-xs font-bold tracking-wide text-zinc-200 font-sans">
                    {user.handle}
                  </h3>
                </div>

                <div className="flex gap-12 items-center text-right text-xs font-mono font-bold">
                  {/* Total Unique Solved Problems */}
                  <span className="w-16 text-emerald-400 font-black">{user.solvedCount}</span>
                  
                  {/* Total Code Submission Counts */}
                  <span className="w-16 text-zinc-500">{user.totalSubmissions}</span>
                  
                  {/* High Resolution Hardware Performance Metrics */}
                  <span className="w-24 text-right text-cyan-400 font-black tracking-wide">
                    {user.avgSpeedMs ? `${user.avgSpeedMs.toFixed(3)} ms` : '--'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}