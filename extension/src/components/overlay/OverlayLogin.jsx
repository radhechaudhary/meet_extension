import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

export default function OverlayLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:4000/user/login", { gmail: email, password }, { withCredentials: true });
      onLoginSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-white">Sign In</h2>
        <p className="text-xs text-slate-400">Connect your account</p>
      </div>

      {error && (
        <div className="p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-xs text-center">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          className="bg-[#202124] border border-[#3C4043] p-2 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="bg-[#202124] border border-[#3C4043] p-2 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg text-sm font-medium transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
        </button>
      </form>
    </div>
  );
}
