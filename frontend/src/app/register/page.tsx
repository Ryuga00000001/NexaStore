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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full bg-[#12141a] p-8 rounded-xl border border-gray-800 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign Up</h2>
        {error && <div className="mb-4 text-red-500 bg-red-500/10 p-3 rounded">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-gray-400 mb-1">Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-[#1a1d24] border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-[#1a1d24] border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-400 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-[#1a1d24] border border-gray-700 rounded p-3 text-white focus:border-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white p-3 rounded font-bold transition-colors">
            Register
          </button>
        </form>
        <p className="mt-4 text-gray-400 text-center">
          Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
