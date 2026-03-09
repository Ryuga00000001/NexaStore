"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      login(
        { _id: data._id, name: data.name, email: data.email, role: data.role },
        data.token
      );
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false); // Set loading to false after request completes
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark py-12 px-6 relative z-10 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
           <h2 className="text-4xl font-black text-white uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,42,42,0.4)]">Enlistment</h2>
           <p className="text-gray-400 mt-2 font-mono text-sm uppercase tracking-widest">Create Your Operative Profile</p>
        </div>
        
        <div className="bg-background-light border border-primary/30 p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden">
          {/* Aggressive Corner accents */}
          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
          <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
          
          <form onSubmit={handleRegister} className="space-y-6 relative z-10">
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2" htmlFor="name">
                Codename
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono placeholder:text-gray-600"
                placeholder="GHOST_OP"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2" htmlFor="email">
                Email / Target
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono placeholder:text-gray-600"
                placeholder="operative@nexa.net"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2" htmlFor="password">
                Pass-Key
              </label>
              <input
                type="password"
                id="password"
                required
                className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono placeholder:text-gray-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
               <div className="p-3 bg-red-900/40 border border-red-500 text-red-400 font-mono text-xs uppercase tracking-widest">
                 DENIED: {error}
               </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-red-500 text-white p-4 font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 mt-4 shadow-[0_0_15px_rgba(255,42,42,0.3)] hover:shadow-[0_0_30px_rgba(255,42,42,0.7)]"
              >
                {loading ? 'TRANSMITTING...' : 'CONFIRM ENLISTMENT'}
              </button>
            </div>
            
            <p className="text-center font-mono text-xs text-gray-400 uppercase tracking-widest mt-4">
              Already enlisted?{' '}
              <button type="button" onClick={() => router.push('/login')} className="text-primary hover:text-white font-bold underline transition-colors">
                 Login Node
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
