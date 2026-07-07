import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Star, Sparkles, Heart, Share2, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductSlug } from '../lib/slug';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const navigate = useNavigate();
  const [shareToast, setShareToast] = useState(false);

  if (!product) return null;

  const price = Number(product.price !== undefined ? product.price : (product.offer_price || 0));
  const originalPrice = Number(product.originalPrice !== undefined ? product.originalPrice : (product.original_price || 0));
  const name = product.name || product.product_name || 'GiftMe Signature Piece';
  const shortDescription = product.shortDescription || product.description || '';
  const images = (product.images && product.images.length > 0) ? product.images : [product.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'];
  const category = product.category || 'Luxury Key Holder';
  const rating = product.rating || 4.9;
  const reviewCount = product.reviewCount || 128;
  const badge = product.badge;
  const id = product.id;
  const wishlisted = isWishlisted(id);
  const slug = getProductSlug({ ...product, name, id });
  const isOutOfStock = product.in_stock === false || product.stock_status === 'Out of Stock' || product.in_stock === 'false';

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ ...product, id, name, price, originalPrice, images }, 1, '');
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${slug}`);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/product/${slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: shortDescription, url });
      } else {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url).catch(() => {});
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const discountPercentage = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div
      onClick={() => navigate(`/product/${slug}`)}
      className="group bg-cream-100 rounded-2xl border border-cream-300 transition-all duration-300 hover:shadow-luxury-hover hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer relative overflow-hidden"
    >
      {/* Product Image Container — Edge-to-Edge and 100% clean/unobstructed */}
      <div className="relative aspect-[4/4.3] sm:aspect-square w-full overflow-hidden bg-cream-200">
        <img
          src={images[0]}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-108"
        />
        
        {isOutOfStock && (
          <div className="absolute inset-0 bg-cream-100/60 backdrop-blur-[1px] z-10 flex items-center justify-center pointer-events-none">
            <span className="bg-red-600 text-white font-bold px-3.5 py-1.5 rounded-lg text-xs uppercase tracking-widest shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Subtle hover overlay for desktop */}
        <div className="absolute inset-0 bg-charcoal/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 gap-2">
          <button
            onClick={handleQuickView}
            className="flex-1 bg-cream-100/95 backdrop-blur-sm text-charcoal py-2.5 rounded-xl font-medium text-xs shadow-sm hover:bg-charcoal hover:text-cream-100 transition-all flex items-center justify-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Quick View
          </button>
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              className="p-2.5 bg-charcoal text-gold hover:bg-gold hover:text-charcoal-950 rounded-xl transition-all shadow-sm"
              aria-label="Add to Bag"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">
        {/* Badges & Rating row */}
        <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
          <div className="flex items-center gap-1 flex-wrap">
            {badge ? (
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide flex items-center gap-1 ${
                  badge === 'Best Seller'
                    ? 'bg-charcoal text-gold border border-gold/40'
                    : badge === 'New Arrival'
                    ? 'bg-gold text-charcoal-950 font-bold'
                    : 'bg-cream-200 text-charcoal border border-cream-400'
                }`}
              >
                {badge === 'Best Seller' && <Sparkles className="w-2.5 h-2.5" />}
                {badge}
              </span>
            ) : null}
            {discountPercentage > 0 && (
              <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-md border border-red-200">
                {discountPercentage}% OFF
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 text-charcoal font-semibold text-xs ml-auto">
            <Star className="w-3 h-3 fill-gold text-gold" />
            <span>{rating}</span>
            <span className="text-stone-warm font-normal text-[10px] sm:text-xs">({reviewCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <h3 className="font-serif font-semibold text-charcoal text-sm sm:text-base leading-snug group-hover:text-gold-700 transition-colors line-clamp-1 mb-1">
          {name}
        </h3>

        {/* Short Description */}
        <p className="text-[11px] sm:text-xs text-stone-warm line-clamp-2 leading-relaxed mb-3 sm:mb-4">
          {shortDescription}
        </p>

        {/* Price & Action Buttons */}
        <div className="mt-auto pt-3 border-t border-cream-200 flex flex-col gap-2.5 sm:gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="font-serif text-base sm:text-lg font-bold text-charcoal">₹{price.toLocaleString()}</span>
              {originalPrice > price && (
                <span className="text-[11px] sm:text-xs text-stone-warm line-through ml-1.5 sm:ml-2">₹{originalPrice.toLocaleString()}</span>
              )}
            </div>
            {/* Wishlist & Share Buttons neatly next to price */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`p-1.5 sm:p-2 rounded-lg border transition-all duration-200 ${
                  wishlisted
                    ? 'bg-red-500 border-red-500 text-white shadow-sm'
                    : 'bg-cream-200/80 border-cream-300 text-stone-warm hover:border-red-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-white' : ''}`} />
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  aria-label="Share product"
                  className="p-1.5 sm:p-2 rounded-lg bg-cream-200/80 border border-cream-300 text-stone-warm hover:border-gold hover:text-gold transition-all duration-200"
                >
                  {shareToast ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                </button>
                {shareToast && (
                  <div className="absolute right-0 bottom-full mb-1 bg-charcoal text-cream-100 text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap shadow-lg pointer-events-none z-30">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
            <button
              onClick={handleQuickView}
              className="py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl border border-cream-400 text-charcoal text-[11px] sm:text-xs font-semibold hover:border-charcoal transition-all text-center"
            >
              View Details
            </button>
            {isOutOfStock ? (
              <button
                disabled
                className="py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-red-100 text-red-600 border border-red-200 text-[11px] sm:text-xs font-bold transition-all text-center cursor-not-allowed opacity-80"
              >
                Out of Stock
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl bg-charcoal text-cream-100 hover:bg-gold hover:text-charcoal-950 text-[11px] sm:text-xs font-semibold transition-all flex items-center justify-center gap-1 sm:gap-1.5 shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                <span>Add to Cart</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
