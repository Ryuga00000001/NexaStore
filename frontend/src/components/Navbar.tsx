"use client";

import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { ShoppingCart, LogOut, Package } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { items } = useCartStore();
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="flex items-center justify-between px-8 py-6 lg:px-20 max-w-[1440px] mx-auto w-full z-20 relative bg-background-dark/80 backdrop-blur-md border-b border-primary/20">
      <Link href="/" className="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-105">
        <div className="text-primary group-hover:drop-shadow-[0_0_10px_rgba(255,42,42,0.8)] transition-all">
          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-black tracking-[0.2em] uppercase text-white drop-shadow-[0_0_5px_rgba(255,42,42,0.5)]">NEXA</h2>
      </Link>

      <nav className="hidden lg:flex items-center gap-10">
        <Link href="/" className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-[0.15em] text-primary border-b-2 border-primary pb-1">Home</Link>
        <Link href="#" className="text-sm font-bold hover:text-primary transition-colors text-gray-400 uppercase tracking-[0.15em]">Products</Link>
        <Link href="#" className="text-sm font-bold hover:text-primary transition-colors text-gray-400 uppercase tracking-[0.15em]">Support</Link>
      </nav>

      <div className="flex items-center gap-6">
        {mounted && user ? (
          <>
            <Link href="/orders" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest hidden md:block">
              Orders
            </Link>
            <Link href="/dashboard" className="text-sm font-semibold hover:text-primary transition-colors uppercase tracking-widest hidden md:block">
              Dashboard
            </Link>
            <Link href="/cart" className="relative group p-2">
              <ShoppingCart className="h-6 w-6 text-gray-300 group-hover:text-primary transition-colors group-hover:drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]" />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary shadow-[0_0_10px_rgba(255,42,42,0.8)] border border-red-400">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-primary transition-colors uppercase tracking-[0.1em] font-black drop-shadow-[0_0_5px_rgba(255,42,42,0.3)]"
            >
              Logout
            </button>
          </>
        ) : (
          mounted && (
            <>
              <Link href="/login" className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest">
                Login
              </Link>
              <Link
                href="/register"
                className="bg-transparent border-2 border-primary hover:bg-primary text-primary hover:text-white px-6 py-2 shadow-[0_0_10px_rgba(255,42,42,0.2)] hover:shadow-[0_0_15px_rgba(255,42,42,0.8)] font-black text-sm transition-all uppercase tracking-widest"
              >
                Register
              </Link>
            </>
          )
        )}
      </div>
    </header>
  );
}
