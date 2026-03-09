"use client";

import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { Trash2, ShoppingBag, Truck } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, total, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    setMounted(true);
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, mounted, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/orders', {
        items: items.map(i => ({ product: i.product, quantity: i.quantity, price: i.price })),
        shippingAddress: address,
        phone: phone
      }, {
         headers: { Authorization: `Bearer ${token}` }
      });
      
      clearCart();
      router.push('/orders');
    } catch (error) {
      console.error('Checkout failed', error);
      alert('Checkout failed! Is backend running?');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !user) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="bg-background-light border border-primary/20 p-12 shadow-[0_0_20px_rgba(255,42,42,0.2)] inline-block relative">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
            
            <ShoppingBag className="mx-auto h-16 w-16 text-primary mb-6 animate-pulse" />
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">INVENTORY EMPTY</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto font-mono text-sm">Return to the armory and select your loadout before proceeding to checkout.</p>
            <Link 
              href="/" 
              className="inline-block bg-primary hover:bg-red-500 text-white px-8 py-4 font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(255,42,42,0.4)] transition-all"
            >
              Browse Arsenal
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
      <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-8 drop-shadow-[0_0_10px_rgba(255,42,42,0.4)]">Secure Checkout Node</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background-light border border-primary/30 relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
            <div className="p-6 border-b border-primary/20 bg-background-dark/50">
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Loadout Summary</h2>
            </div>
            <ul className="divide-y divide-primary/10">
              {items.map((item) => (
                <li key={item.product} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-background-dark border border-gray-800 flex-shrink-0 relative overflow-hidden">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs font-black tracking-widest">NEXA</div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-wide">{item.name}</h3>
                      <p className="text-gray-400 font-mono text-xs mb-3">QUANTITY: [ {item.quantity} ]</p>
                      <button 
                        onClick={() => removeItem(item.product)}
                        className="text-primary hover:text-red-400 text-sm flex items-center gap-1 font-bold transition-colors uppercase tracking-widest"
                      >
                        <Trash2 className="w-4 h-4" /> Drop Item
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-2xl text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-background-light border border-primary/30 p-8 sticky top-8 relative shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
            
            <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-6 border-b border-primary/20 pb-4">Drop Zone Coords</h2>
            
            <form onSubmit={handleCheckout} className="space-y-6 relative z-10">
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Shipping Sector (Address)</label>
                <input 
                  type="text" 
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
                  placeholder="123 Alpha Sector, NY 10001"
                />
              </div>

              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Comms Frequency (Phone)</label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-4 pt-6 mt-6 border-t border-primary/20 font-mono">
                <div className="flex justify-between text-gray-300">
                  <span>SUBTOTAL</span>
                  <span className="font-semibold text-white">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>SHIPPING</span>
                  <span className="font-semibold text-primary">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-black text-white pt-4 border-t border-gray-700">
                  <span>TOTAL ESTIMATE</span>
                  <span className="text-primary drop-shadow-[0_0_8px_rgba(255,42,42,0.8)]">${total().toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-red-500 disabled:bg-gray-800 text-white p-4 font-black uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-[0_0_15px_rgba(255,42,42,0.4)] hover:shadow-[0_0_25px_rgba(255,42,42,0.8)] mt-8 relative"
              >
                <Truck className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{loading ? 'TRANSMITTING...' : 'INITIATE DEPLOYMENT'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
