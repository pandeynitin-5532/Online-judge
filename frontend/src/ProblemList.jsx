import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProblemList() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
        console.error("Error loading dashboard listing:", err);
        setLoading(false);
      });
  }, []);

  // Helper mock mapping for difficulties since they share a 10-problem matrix
  const getDifficultyBadge = (index) => {
    if (index % 3 === 0) return <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Easy</span>;
    if (index % 3 === 1) return <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Medium</span>;
    return <span className="text-xs font-semibold px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">Hard</span>;
  };

  return (
    <div className="min-h-screen w-screen bg-zinc-950 text-zinc-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Dashboard Frame */}
        <div className="flex flex-col gap-1 border-b border-zinc-800 pb-6 mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            CodeMatrix Engine
          </h1>
          <p className="text-sm text-zinc-400">Select an execution matrix challenge to begin automated judging runs.</p>
        </div>

        {loading ? (
          <div className="text-zinc-500 text-sm animate-pulse font-mono">Querying core cluster tables...</div>
        ) : problems.length === 0 ? (
          <div className="text-zinc-500 italic text-sm">No problem profiles discovered in database file grid.</div>
        ) : (
          /* Dashboard Grid Distribution */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problems.map((prob, idx) => (
              <div
                key={prob.id}
                onClick={() => navigate(`/problem/${prob.id}`)}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between hover:border-zinc-700 hover:bg-zinc-900 transition-all duration-200 cursor-pointer active:scale-[0.99] group shadow-lg"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 font-mono text-xs font-bold group-hover:text-zinc-400 transition-colors">
                      #{idx + 1}
                    </span>
                    <h3 className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors">
                      {prob.title}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 font-mono tracking-tight">ID: {prob.id}</p>
                </div>

                <div className="flex items-center gap-4">
                  {getDifficultyBadge(idx)}
                  <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors text-sm font-bold font-mono">
                    &rarr;
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