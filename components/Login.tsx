
import React, { useState } from 'react';
import { User, Share2, Lock, UserCircle, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  users: UserType[];
  onLogin: (user: UserType) => void;
  appLogo: string | null;
  companyName: string;
}

const Login: React.FC<LoginProps> = ({ users, onLogin, appLogo, companyName }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Username atau Password salah!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2"></div>

      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 relative z-10 animate-in zoom-in duration-300">
        <div className="text-center mb-10">
          <div className="inline-flex mb-6 transition-all duration-500">
            {appLogo ? (
              <div className="w-24 h-24 bg-white p-2 rounded-3xl shadow-xl shadow-indigo-100/50 border border-slate-50">
                 <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="p-4 bg-indigo-600 rounded-3xl shadow-xl shadow-indigo-100">
                <Share2 size={48} className="text-white" />
              </div>
            )}
          </div>
          <h1 className="text-3xl font-black text-slate-900">{companyName}</h1>
          <p className="text-slate-500 mt-2 font-medium">Silakan masuk ke panel ISP Anda</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in shake">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
            <div className="relative">
              <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                required
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username..."
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                required
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-600 transition-all font-bold"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black text-lg shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-slate-400 text-xs font-medium italic">{companyName} Pro v2.6</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
