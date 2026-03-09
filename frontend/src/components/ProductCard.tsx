import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

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

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.imageUrl,
      maxStock: product.stock
    });
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col gap-4 group">
      <div className="relative aspect-[4/5] overflow-hidden bg-background-light border border-transparent transition-all duration-300 group-hover:border-primary/50 group-hover:shadow-[0_0_15px_rgba(255,42,42,0.2)]">
        {product.imageUrl ? (
          <Image 
            src={product.imageUrl} 
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110 filter hover:contrast-125"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-600 font-black text-2xl uppercase tracking-widest opacity-20">
            NEXA
          </div>
        )}
        
        {isOutOfStock && (
          <div className="absolute top-4 left-4 z-10">
             <span className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(255,42,42,0.8)] border border-red-400">
               Sold Out
             </span>
          </div>
        )}
        
        {/* Aggressive Corner accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>

        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 z-10">
          <button 
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="w-12 h-12 flex items-center justify-center bg-primary hover:bg-red-500 disabled:bg-gray-800 text-white shadow-[0_0_15px_rgba(255,42,42,0.5)] hover:shadow-[0_0_25px_rgba(255,42,42,0.8)] transition-all"
            title="Add to Cart"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="flex flex-col px-2 mt-2">
        <div className="flex justify-between items-start">
          <h4 className="font-extrabold text-lg text-white uppercase tracking-wide group-hover:text-primary transition-colors">{product.name}</h4>
          <span className="text-white font-black text-lg ml-4 bg-primary/20 px-2 py-0.5 border border-primary/30 text-shadow-sm">${product.price.toFixed(2)}</span>
        </div>
        
        {product.vendor?.storeName ? (
           <p className="text-gray-400 text-[10px] mb-2 font-bold uppercase tracking-widest">Op: <span className="text-primary">{product.vendor.storeName}</span></p>
        ) : (
           <p className="text-gray-400 text-[10px] mb-2 font-bold uppercase tracking-widest">Op: <span className="text-primary">Nexa Official</span></p>
        )}
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed font-mono text-xs">{product.description}</p>
      </div>
    </div>
  );
}
