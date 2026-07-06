import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowRight, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { products as localProducts, uploadedProducts } from '../data/products';
import { fetchProducts } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist, isWishlisted, clearWishlist, count } = useWishlist();
  const { addToCart } = useCart();
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCatalog() {
      setLoading(true);
      try {
        const data = await fetchProducts();
        const mapped = (data || []).map((p) => ({
          ...p,
          id: p.id,
          name: p.product_name || p.name,
          price: Number(p.offer_price || p.price || 0),
          originalPrice: Number(p.original_price || p.originalPrice || 0),
          shortDescription: p.description || p.shortDescription || '',
          images: p.images || [p.image_url || '/assets/main view of product1.jpeg'],
          category: p.category || 'General',
          created_at: p.created_at || new Date(0).toISOString()
        }));

        // Combine supabase, uploadedProducts, and localProducts without duplicates
        const allProducts = [...mapped, ...uploadedProducts, ...localProducts];
        const uniqueProducts = allProducts.filter((prod, idx, self) =>
          idx === self.findIndex((t) => String(t.id) === String(prod.id))
        );
        setCatalog(uniqueProducts);
      } catch (err) {
        console.error('Failed to load products for wishlist:', err);
        const allProducts = [...uploadedProducts, ...localProducts];
        const uniqueProducts = allProducts.filter((prod, idx, self) =>
          idx === self.findIndex((t) => String(t.id) === String(prod.id))
        );
        setCatalog(uniqueProducts);
      } finally {
        setLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const wishlistedProducts = catalog.filter((product) => isWishlisted(product.id));

  const handleMoveAllToBag = () => {
    wishlistedProducts.forEach((product) => {
      if (product.in_stock !== false && product.stock_status !== 'Out of Stock') {
        addToCart(product, 1, '');
      }
    });
    clearWishlist();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 font-sans min-h-[70vh] animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-cream-300 pb-8 mb-10 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/20 text-charcoal text-xs font-bold tracking-wider uppercase mb-3 border border-gold/40">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Curated Favorites</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal tracking-tight flex items-center gap-3">
            Your Wishlist <span className="text-gold-700 font-normal">({count})</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-warm mt-2 max-w-xl leading-relaxed">
            Personal collection of luxury key holders and architectural pieces you have saved for later.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleMoveAllToBag}
              className="bg-charcoal hover:bg-gold text-cream-100 hover:text-charcoal-950 px-6 py-3 rounded-xl font-bold text-xs transition-all shadow-luxury flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <ShoppingBag className="w-4 h-4" /> Move All to Bag
            </button>
            <button
              onClick={clearWishlist}
              className="bg-cream-200 hover:bg-red-500/10 text-stone-warm hover:text-red-600 border border-cream-300 hover:border-red-500/30 px-4 py-3 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-cream-200 rounded-2xl border border-cream-300"></div>
          ))}
        </div>
      ) : wishlistedProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-cream-200/50 rounded-3xl border border-cream-300 p-12 sm:p-20 text-center max-w-2xl mx-auto my-8 shadow-sm">
          <div className="w-20 h-20 bg-gold/20 text-gold-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-gold/30">
            <Heart className="w-10 h-10 fill-gold/40 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mb-3">
            Your Wishlist is Currently Empty
          </h2>
          <p className="text-xs sm:text-sm text-stone-warm max-w-md mx-auto mb-8 leading-relaxed">
            You haven't saved any signature pieces yet. Explore our catalog and click the heart icon on any product to save it here for quick access later!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-gold hover:bg-gold-400 text-charcoal-950 px-8 py-4 rounded-xl font-bold text-xs tracking-wide transition-all shadow-luxury active:scale-98"
          >
            Explore Shop Collection <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Wishlist Grid */
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
