import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  Plus, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { fetchProducts } from '../../lib/supabase';

export default function AdminDashboard() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const prodList = await fetchProducts();
      setProducts(prodList || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const inStockCount = products.filter(p => p.in_stock !== false && p.stock_status !== 'Out of Stock' && p.in_stock !== 'false').length;
  const outOfStockCount = products.length - inStockCount;
  const outOfStockProducts = products.filter(p => p.in_stock === false || p.stock_status === 'Out of Stock' || p.in_stock === 'false');

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-charcoal to-charcoal-900 p-6 sm:p-8 rounded-3xl text-cream-100 shadow-luxury">
        <div>
          <span className="bg-gold/20 text-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gold/40 flex items-center gap-1.5 w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5" /> All-In-One CMS
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-cream-100">
            Executive Overview Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-warm mt-1">
            Real-time inventory statistics, stock alerts, and storefront live status.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            onClick={() => navigate('/admin/categories')}
            className="bg-cream-100/10 hover:bg-cream-100/20 text-cream-100 border border-gold/40 px-5 py-3 rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-gold" /> Manage Categories
          </button>
          <button
            onClick={() => navigate('/admin/products')}
            className="bg-gold hover:bg-gold-400 text-charcoal-950 px-6 py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload / Edit Products
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
          onClick={() => navigate('/admin/products')}
          className="bg-cream-100 p-6 rounded-3xl border border-cream-300 hover:border-gold transition-all shadow-sm flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">Total Products</span>
            <div className="p-3 bg-gold/15 text-gold-700 rounded-2xl group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-charcoal">{products.length}</span>
            <p className="text-[11px] text-stone-warm mt-1">Total items in catalog</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/products')}
          className="bg-cream-100 p-6 rounded-3xl border border-cream-300 hover:border-emerald-500 transition-all shadow-sm flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">In-Stock Items</span>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-emerald-600">{inStockCount}</span>
            <p className="text-[11px] text-stone-warm mt-1">Ready for immediate dispatch</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/products')}
          className="bg-cream-100 p-6 rounded-3xl border border-cream-300 hover:border-red-500 transition-all shadow-sm flex flex-col justify-between cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">Out of Stock</span>
            <div className="p-3 bg-red-500/15 text-red-600 rounded-2xl group-hover:scale-110 transition-transform">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-red-600">{outOfStockCount}</span>
            <p className="text-[11px] text-stone-warm mt-1">Requires restocking / offline</p>
          </div>
        </div>

        <div className="bg-cream-100 p-6 rounded-3xl border border-cream-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">Storefront Status</span>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-xl font-bold text-emerald-600 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> Online & Active
            </span>
            <Link to="/" target="_blank" className="text-[11px] text-gold-700 font-semibold hover:underline flex items-center gap-1 mt-1">
              Open live catalog <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Portal Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div 
          onClick={() => navigate('/admin/products')}
          className="bg-gradient-to-br from-cream-100 to-cream-200 p-8 rounded-3xl border-2 border-gold/40 hover:border-gold shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-charcoal text-gold flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal group-hover:text-gold-700 transition-colors">
              Product Inventory & Upload Portal
            </h3>
            <p className="text-xs sm:text-sm text-stone-warm leading-relaxed">
              Upload new architectural gifts, edit existing product pricing, update stock availability, and manage image galleries on a dedicated page.
            </p>
          </div>
          <div className="pt-6 flex items-center gap-2 text-xs font-bold text-charcoal group-hover:text-gold-700">
            <span>Open Product Management</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/categories')}
          className="bg-gradient-to-br from-cream-100 to-cream-200 p-8 rounded-3xl border-2 border-gold/40 hover:border-gold shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-charcoal text-gold flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal group-hover:text-gold-700 transition-colors">
              Category Taxonomy Portal
            </h3>
            <p className="text-xs sm:text-sm text-stone-warm leading-relaxed">
              Create new categories, rename existing classifications across your catalog, or remove obsolete categories on a dedicated page.
            </p>
          </div>
          <div className="pt-6 flex items-center gap-2 text-xs font-bold text-charcoal group-hover:text-gold-700">
            <span>Open Category Management</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Out of Stock Alert Section (Only if there are out of stock items) */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-red-500/10 border-2 border-red-500/30 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <h4 className="font-serif font-bold text-lg">Out of Stock Alert ({outOfStockProducts.length} Items)</h4>
          </div>
          <p className="text-xs text-stone-warm">
            The following items are currently marked as Sold Out or out of stock. Click any item to jump directly to product management and update inventory.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {outOfStockProducts.map(p => (
              <div 
                key={p.id}
                onClick={() => navigate('/admin/products')}
                className="bg-cream-100 p-3.5 rounded-xl border border-red-200 hover:border-red-400 cursor-pointer flex items-center justify-between transition-all"
              >
                <span className="text-xs font-bold text-charcoal truncate">{p.product_name || p.name}</span>
                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded ml-2 shrink-0">Sold Out</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
