"use client";

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/axios';

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');

    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('image', imageFile);
        
        const uploadRes = await api.post('/uploads', uploadData, {
          headers: { 
             'Content-Type': 'multipart/form-data',
             Authorization: `Bearer ${token}` 
          }
        });
        finalImageUrl = uploadRes.data.imageUrl;
      }

      await api.post('/products', {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        imageUrl: finalImageUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess('Hardware specs successfully uploaded to the central server.');
      setFormData({ name: '', description: '', price: '', stock: '', category: '', imageUrl: '' });
      setImageFile(null);
    } catch (error) {
      console.error('Error adding product', error);
      alert('Failed to deploy hardware. Verify network connection and permissions.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'admin' && user.role !== 'vendor')) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-8 drop-shadow-[0_0_10px_rgba(255,42,42,0.4)]">Vendor Command Center</h1>

      <div className="bg-background-light border border-primary/30 p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
        {/* Aggressive Corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary"></div>
        
        <h2 className="text-2xl font-bold text-white mb-6 uppercase tracking-widest border-b border-primary/20 pb-4">Deploy New Hardware</h2>

        {success && (
          <div className="mb-6 p-4 bg-green-900/40 border border-green-500 text-green-400 font-mono text-sm uppercase">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Hardware Name</label>
              <input
                type="text"
                required
                className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="PRO GAMING MOUSE"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="129.99"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Inventory Stock</label>
              <input
                type="number"
                required
                className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="500"
              />
            </div>
            <div>
              <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Class / Category</label>
              <input
                type="text"
                required
                className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="PERIPHERALS"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Specs Description</label>
            <textarea
              required
              rows={3}
              className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Visual Intel (Image)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:border file:border-primary file:bg-transparent file:text-primary hover:file:bg-primary hover:file:text-white transition-all cursor-pointer font-mono text-sm uppercase tracking-widest"
              onChange={(e) => {
                if(e.target.files) {
                  setImageFile(e.target.files[0]);
                }
              }}
            />
            <p className="text-xs text-primary/50 mt-2 font-mono uppercase tracking-widest">Or provide absolute net-link below:</p>
          </div>

          <div>
            <label className="block text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Net-Link URL (Fallback)</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-background-dark border border-gray-800 p-3 text-white focus:border-primary outline-none transition-colors font-mono"
              placeholder="https://server.com/image.png"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-red-500 text-white p-4 font-black text-xl uppercase tracking-[0.2em] transition-all disabled:opacity-50 mt-4 shadow-[0_0_15px_rgba(255,42,42,0.3)] hover:shadow-[0_0_30px_rgba(255,42,42,0.7)]"
            >
              {loading ? 'UPLOADING...' : 'DEPLOY TO ARSENAL'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
