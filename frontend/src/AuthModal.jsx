import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); 
  const [profile, setProfile] = useState({ nickname: '', dob: '', profession: 'Student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Step 1: Submit Email to receive OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return setError('Please enter a valid developer email.');
    setError('');
    激setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/otp-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStep(2);
      } else {
        setError(data.message || 'Failed to dispatch verification code.');
      }
    } catch (err) {
      setError('Backend communication offline.');
    } finally { // Fixed typo from 'final' to 'finally'
      setLoading(false);
    }
  };

  // Step 2: Submit OTP token to trade for signed JWT Session Token
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) return setError('Enter the full 6-digit verification sequence.');
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/otp-verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return setError(data.message || 'Invalid authentication parameters.');
      }

      localStorage.setItem('oj_token', data.token);
      localStorage.setItem('oj_user', JSON.stringify(data.user));

      if (data.isOnboarded) {
        onAuthSuccess(data.user);
        onClose();
      } else {
        setStep(3); 
      }
    } catch (err) {
      setError('Authentication transaction rejected.');
    } finally { // Fixed typo from 'final' to 'finally'
      setLoading(false);
    }
  };

  // Step 3: Complete Profiling Details Form
  const handleOnboarding = async (e) => {
    e.preventDefault();
    if (!profile.nickname || !profile.dob) return setError('All onboarding attributes required.');
    setError('');
    setLoading(true);

    const token = localStorage.getItem('oj_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/onboard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const structuralUser = { id: JSON.parse(localStorage.getItem('oj_user')).id, nickname: profile.nickname, email };
        localStorage.setItem('oj_user', JSON.stringify(structuralUser));
        onAuthSuccess(structuralUser);
        onClose();
      } else {
        setError(data.message || 'Nickname allocation failed.');
      }
    } catch (err) {
      setError('Profile persistence transaction error.');
    } finally { // Fixed typo from 'final' to 'finally'
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
      <div className="w-full max-w-md p-8 border border-white/10 rounded-2xl bg-slate-900/40 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 tracking-wide">
            {step === 3 ? 'IDENTITY ONBOARDING' : 'COSMIC ARENA LOGIN'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">Passwordless cryptographic entry sequence</p>

          {error && (
            <div className="p-3 mb-4 text-xs text-rose-400 border border-rose-500/20 bg-rose-500/10 rounded-xl">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 uppercase">Developer Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-white/10 rounded-xl bg-white/5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="operator@domain.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold text-black bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Requesting Loop...' : 'Dispatch Verification Token'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 uppercase">6-Digit Verification Token</label>
                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[0.5em] text-xl font-bold py-3 border border-white/10 rounded-xl bg-white/5 text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold text-black bg-gradient-to-r from-cyan-400 to-purple-400 rounded-xl hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Validating Token...' : 'Verify Cryptographic Credentials'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleOnboarding} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 uppercase">Arena Callsign (Nickname)</label>
                <input
                  type="text"
                  required
                  value={profile.nickname}
                  onChange={(e) => setProfile({ ...profile, nickname: e.target.value })}
                  className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500"
                  placeholder="CyberOperator"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 uppercase">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={profile.dob}
                  onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                  className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-slate-300 text-sm focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 tracking-widest mb-1.5 uppercase">Professional Status</label>
                <select
                  value={profile.profession}
                  onChange={(e) => setProfile({ ...profile, profession: e.target.value })}
                  className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-slate-900 text-slate-300 text-sm focus:outline-none focus:border-purple-500"
                >
                  <option value="Student">Student</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Hobbyist">Hobbyist</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-bold text-black bg-gradient-to-r from-purple-400 to-cyan-400 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Registering Call Sign...' : 'Commit Identity Profile'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}