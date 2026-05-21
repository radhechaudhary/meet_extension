import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual signup logic
    console.log('Signup attempt', { name, email, password });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-950 p-4 font-sans">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm">Join us and start managing</p>
        </div>
        
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-medium" htmlFor="name">
              Full Name
            </label>
            <input 
              className="bg-slate-900/60 border border-white/10 p-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-all"
              type="text" 
              id="name" 
              placeholder="Enter your name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-medium" htmlFor="email">
              Email
            </label>
            <input 
              className="bg-slate-900/60 border border-white/10 p-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-all"
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-slate-300 text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input 
              className="bg-slate-900/60 border border-white/10 p-3 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25 transition-all"
              type="password" 
              id="password" 
              placeholder="Create a password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button 
            type="submit" 
            className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none py-3.5 px-4 rounded-xl font-semibold cursor-pointer transition-all hover:-translate-y-0.5 hover:opacity-90 active:translate-y-0"
          >
            Sign Up
          </button>
        </form>
        
        <div className="text-center mt-6 text-slate-400 text-sm">
          <p>Already have an account? <Link to="/login" className="text-purple-400 font-semibold hover:text-pink-500 transition-colors">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
