"use client";

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { Package, Download, MapPin, Phone, Crosshair } from 'lucide-react';
import api from '@/lib/axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  shippingAddress: string;
  phone?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (mounted && !user) {
      router.push('/login');
    }
  }, [user, mounted, router]);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    },
    enabled: !!token,
  });

  const downloadInvoice = async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Nexa_Intel_Drop_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to extract Intel Report.');
    }
  };

  if (!mounted || !user) return null;

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
      <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-8 drop-shadow-[0_0_10px_rgba(255,42,42,0.4)]">Hardware Drop History</h1>
      
      {!orders || orders.length === 0 ? (
        <div className="text-center py-24 bg-background-light border border-primary/20 shadow-[0_0_20px_rgba(255,42,42,0.1)] relative">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
          <Crosshair className="mx-auto h-16 w-16 text-primary mb-4 animate-spin-slow" />
          <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">NO DEPLOYMENTS DETECTED.</h2>
          <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Awaiting your tactical deployment orders.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="bg-background-light border border-primary/30 relative shadow-[0_0_15px_rgba(0,0,0,0.8)] overflow-hidden">
               {/* Aggressive Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
              <div className="border-b border-primary/20 bg-background-dark/50 p-6 flex flex-wrap gap-6 justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Time To Target</p>
                  <p className="font-mono text-white tracking-widest">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 py-1 px-3 bg-red-900/40 text-red-400 border border-primary/50 font-mono text-xs uppercase tracking-widest shadow-[0_0_5px_rgba(255,42,42,0.5)]">
                    <span className="w-1.5 h-1.5 bg-primary animate-pulse"></span>
                    Preparing / Đang Chuẩn Bị Hàng
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Expenditure</p>
                  <p className="font-black text-white text-xl drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]">${order.totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={() => downloadInvoice(order._id)}
                    className="flex items-center gap-2 text-xs font-black text-white bg-transparent border border-primary hover:bg-primary px-4 py-2 uppercase tracking-widest shadow-[0_0_5px_rgba(255,42,42,0.3)] hover:shadow-[0_0_15px_rgba(255,42,42,0.8)] transition-all"
                  >
                    <Download className="w-4 h-4" /> Intel Report
                  </button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-4">
                   <h4 className="font-black text-white uppercase tracking-widest border-b border-primary/20 pb-2 flex items-center gap-2">
                     <Package className="w-4 h-4 text-primary" /> Arsenal Loadout
                   </h4>
                   <ul className="space-y-3">
                     {order.items.map((item, idx) => (
                       <li key={idx} className="flex justify-between items-center font-mono text-sm border-l-2 border-primary/50 pl-3">
                         <span className="text-gray-300 uppercase leading-snug">{item.product.name} <span className="text-primary ml-2 font-black">X{item.quantity}</span></span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 
                 <div className="space-y-4 md:border-l md:border-primary/20 md:pl-8">
                   <h4 className="font-black text-white uppercase tracking-widest border-b border-primary/20 pb-2 flex items-center gap-2">
                     <MapPin className="w-4 h-4 text-primary" /> Sector Coordinates
                   </h4>
                   <div className="space-y-3 font-mono text-sm">
                      <div className="flex items-start gap-4 text-gray-400">
                         <span className="text-primary font-bold">ADDR //</span>
                         <span className="leading-relaxed">{order.shippingAddress}</span>
                      </div>
                      <div className="flex items-center gap-4 text-gray-400">
                         <span className="text-primary font-bold">TELE //</span>
                         <span className="font-medium">{order.phone || 'CLASSIFIED'}</span>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
