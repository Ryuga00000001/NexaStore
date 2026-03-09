"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import api from '@/lib/axios';
import ProductCard from '@/components/ProductCard';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  vendor: { storeName: string };
}

export default function Home() {
  const queryClient = useQueryClient();
  const [socketConnected, setSocketConnected] = useState(false);

  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get('/products');
      return response.data;
    }
  });

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');
    
    socket.on('connect', () => {
      setSocketConnected(true);
    });

    socket.on('inventory-updated', ({ productId, newStock }: { productId: string, newStock: number }) => {
      queryClient.setQueryData(['products'], (oldData: Product[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(p => p._id === productId ? { ...p, stock: newStock } : p);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [queryClient]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">Error loading products. Is the backend running?</div>;

  return (
    <>
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 dark:opacity-10 -z-10 bg-background-dark">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-primary rounded-full blur-[100px] opacity-30"></div>
      </div>

      {/* Hero Section translated directly from Stitch */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-[1440px] mx-auto w-full px-8 lg:px-20 relative pt-12">
        {/* Watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0 hidden lg:block">
            <span className="vertical-text text-[12rem] lg:text-[18rem] font-black text-primary/10 uppercase tracking-[2rem]">
                NEXA
            </span>
        </div>
        
        {/* Left Content */}
        <div className="flex-1 flex flex-col justify-center py-12 lg:py-24 z-10 lg:pr-10">
            <div className="space-y-6 lg:max-w-xl">
                <span className="inline-block text-[10px] font-black tracking-[0.2em] text-primary uppercase border-b border-primary/30 pb-1">
                    Free Delivery Worldwide
                </span>
                <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-white uppercase styling-agressive drop-shadow-[0_0_15px_rgba(255,42,42,0.5)]">
                    Dominate <br/>The Game.
                </h1>
                <div className="space-y-4">
                    <p className="text-lg font-bold tracking-wide italic text-primary">
                        High-Performance Gear
                    </p>
                    <p className="text-base text-gray-300 leading-relaxed max-w-md">
                        Precision-engineered gaming peripherals designed for competitive e-sports and ultimate immersion. Elevate your play with NexaStore.
                    </p>
                </div>
                <div className="pt-6">
                    <button className="group relative flex items-center gap-4 bg-primary text-white px-8 py-4 rounded font-bold text-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,42,42,0.8)]">
                        <span className="relative z-10">Gear Up Now</span>
                        <span className="material-symbols-outlined relative z-10 group-hover:translate-x-1 transition-transform">&rarr;</span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                    <div className="mt-4 text-xs font-bold text-primary/60 flex items-center gap-2">
                       <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></span> 
                       {socketConnected ? 'Store Sync API Active' : 'Connecting Store Sync...'}
                    </div>
                </div>
            </div>
        </div>
        
        {/* Right Content */}
        <div className="flex-1 relative flex items-center justify-center min-h-[400px] lg:min-h-0 z-10 w-full mt-10 lg:mt-0">
            <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute bottom-[20%] w-[60%] h-[10%] bg-primary/20 rounded-full blur-2xl"></div>
                <div className="relative w-[300px] h-[450px] lg:w-[450px] lg:h-[600px] flex items-center justify-center">
                    <img 
                      alt="Premium Gaming Headset" 
                      className="w-full h-full object-contain drop-shadow-[0_0_30px_rgba(255,42,42,0.3)] filter contrast-125" 
                      src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=1000&auto=format&fit=crop"
                    />
                </div>
            </div>
        </div>
      </main>

      {/* Main Catalog Grid */}
      <section className="px-6 lg:px-20 py-20 bg-background-light border-y border-primary/20 mt-20 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent"></div>
        <div className="max-w-[1440px] mx-auto z-10 relative">
          <div className="flex flex-col items-center justify-center text-center gap-6 mb-16">
            <div>
              <h2 className="text-4xl font-extrabold mb-4 tracking-tight text-white uppercase drop-shadow-[0_0_10px_rgba(255,42,42,0.5)]">The Arsenal</h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-lg">Browse our highly effective collection, crafted perfectly for optimal performance and critical strikes.</p>
            </div>
          </div>
          
          {!products || products.length === 0 ? (
            <div className="text-center py-32 border border-primary/20 bg-background-dark">
               <h3 className="text-2xl text-white font-bold mb-2">Arsenal Empty</h3>
               <p className="text-gray-400">Register and use the Dashboard to supply the armory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer Elements */}
      <footer className="px-8 lg:px-20 py-12 max-w-[1440px] mx-auto w-full z-10 relative mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-primary/20 pt-12">
            <div className="flex flex-col gap-4 group">
                <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-primary transition-colors uppercase">High Precision</h3>
                </div>
                <p className="text-sm text-gray-400">We use only the highest grade switches, sensors, and mechanical components.</p>
            </div>
            <div className="flex flex-col gap-4 group">
                <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-primary transition-colors uppercase">Low Latency</h3>
                </div>
                <p className="text-sm text-gray-400">Engineered for sub-millisecond response times to give you the competitive edge.</p>
            </div>
            <div className="flex flex-col gap-4 group">
                <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-lg text-white group-hover:text-primary transition-colors uppercase">Durability</h3>
                </div>
                <p className="text-sm text-gray-400">Committed to robust manufacturing to withstand the most intense gaming sessions.</p>
            </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center mt-20 gap-6 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-500">
            <div className="flex gap-8">
                <a className="hover:text-primary transition-colors" href="#">Privacy Policy</a>
                <a className="hover:text-primary transition-colors" href="#">Terms of Service</a>
                <a className="hover:text-primary transition-colors" href="#">Shipping</a>
            </div>
            <p>© 2026 NexaStore Gaming. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
