import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingBag, Eye, Sparkles, Star, Check } from 'lucide-react';
import { uploadedProducts, products as baseCatalog } from '../data/products';
import { useCart } from '../context/CartContext';
import { getProductSlug } from '../lib/slug';

export default function UploadedShowcase({ products: customProducts }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [subImageIndex, setSubImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const rawList = (customProducts && customProducts.length > 0) ? customProducts : (uploadedProducts.length > 0 ? uploadedProducts : baseCatalog);
  const isProductInStock = (p) => p.in_stock !== false && p.stock_status !== 'Out of Stock' && p.in_stock !== 'false';
  const inStockList = rawList.filter(isProductInStock);
  const sourceList = (inStockList.length > 0 ? inStockList : rawList).slice(0, 5);

  // Normalise every product so fields like images/features are never undefined
  const list = sourceList.map((p) => ({
    ...p,
    name: p.name || p.product_name || 'GiftMe Product',
    images: p.images && p.images.length > 0 ? p.images : [p.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
    features: p.features || [],
    description: p.description || p.shortDescription || '',
    price: Number(p.offer_price || p.price || 0),
    originalPrice: Number(p.original_price || p.originalPrice || 0),
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || p.review_count || 0,
    category: p.category || 'Signature',
    badge: p.badge || 'New Arrival',
  }));
  const currentIdx = activeIndex % list.length;
  const currentProduct = list[currentIdx] || list[0];

  // Auto-slide every 6 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % list.length);
      setSubImageIndex(0);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, list.length]);

  const handleSelectProduct = (index) => {
    setActiveIndex(index);
    setSubImageIndex(0);
  };

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % list.length);
    setSubImageIndex(0);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + list.length) % list.length);
    setSubImageIndex(0);
  };

  const handleQuickAdd = () => {
    addToCart(currentProduct, 1, '');
  };

  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/20 text-charcoal text-xs font-bold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-gold-700" />
            <span>Exclusive Atelier Releases</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Signature Flagship Showcase
          </h2>
        </div>

        {/* Top Product Toggle Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-4 md:pt-0 scrollbar-none">
          {list.map((prod, idx) => (
            <button
              key={prod.id || idx}
              onClick={() => handleSelectProduct(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                (activeIndex % list.length) === idx
                  ? 'bg-charcoal text-gold shadow-md scale-102'
                  : 'bg-cream-200 text-charcoal hover:bg-gold/30 border border-cream-300'
              }`}
            >
              <span className="opacity-60 font-mono text-[10px]">0{idx + 1}</span>
              <span>{(prod.name || prod.product_name || '').replace('GiftMe ', '')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Showcase Box */}
      <div className="bg-gradient-to-br from-cream-100 to-cream-200 rounded-3xl border-2 border-gold/40 shadow-luxury overflow-hidden relative transition-all duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-10 items-center">
          {/* Left: Product Image Showcase with Toggle Views */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-cream-100 border border-cream-300 shadow-sm group">
              <img
                src={currentProduct.images[subImageIndex] || currentProduct.images[0]}
                alt={currentProduct.name}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />

              {/* Top Left Badge */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="bg-charcoal text-gold text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {currentProduct.badge}
                </span>
              </div>

              {/* Slider Arrows */}
              <div className="absolute inset-y-0 left-3 flex items-center">
                <button
                  onClick={prevSlide}
                  className="w-10 h-10 rounded-full bg-cream-100/90 text-charcoal shadow-md hover:bg-gold hover:text-charcoal-950 flex items-center justify-center transition-all"
                  aria-label="Previous Flagship"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-3 flex items-center">
                <button
                  onClick={nextSlide}
                  className="w-10 h-10 rounded-full bg-cream-100/90 text-charcoal shadow-md hover:bg-gold hover:text-charcoal-950 flex items-center justify-center transition-all"
                  aria-label="Next Flagship"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-view Thumbnails (e.g. for Product 1 multi-angles) */}
            {currentProduct.images.length > 1 && (
              <div className="flex items-center gap-3 justify-center pt-1">
                <span className="text-[11px] text-stone-warm font-medium">Angle Switcher:</span>
                {currentProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSubImageIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      subImageIndex === idx
                        ? 'bg-charcoal text-gold border-charcoal shadow-xs'
                        : 'bg-cream-100 text-charcoal border-cream-300 hover:border-gold'
                    }`}
                  >
                    {idx === 0 ? 'Main View' : idx === 1 ? 'Front Detail' : 'Side Profile'}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Editorial Content */}
          <div className="lg:col-span-5 space-y-6 text-left animate-fade-in" key={currentProduct.id}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-warm">
                {currentProduct.category}
              </span>
              <div className="flex items-center gap-1 bg-cream-100 px-2.5 py-1 rounded-full border border-cream-300 text-xs font-bold text-charcoal">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                <span>{currentProduct.rating}</span>
                <span className="text-stone-warm font-normal">({currentProduct.reviewCount})</span>
              </div>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal leading-tight">
              {currentProduct.name}
            </h3>

            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-charcoal">
                ₹{currentProduct.price.toLocaleString()}
              </span>
              {currentProduct.originalPrice > currentProduct.price && (
                <span className="text-sm text-stone-warm line-through">
                  ₹{currentProduct.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="text-xs bg-gold/30 text-charcoal-900 font-bold px-2 py-0.5 rounded">
                Save ₹{(currentProduct.originalPrice - currentProduct.price).toLocaleString()}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-cream-300">
              <button
                onClick={() => navigate(`/product/${getProductSlug(currentProduct)}`)}
                className="btn-secondary py-3.5 text-xs font-semibold"
              >
                <Eye className="w-4 h-4" /> View Full Specs
              </button>
              <button
                onClick={handleQuickAdd}
                className="btn-gold py-3.5 text-xs font-bold shadow-md"
              >
                <ShoppingBag className="w-4 h-4" /> Add to Bag
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Slide Indicators */}
        <div className="bg-charcoal text-cream-100 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span>Slide Progress:</span>
            <div className="flex gap-1.5">
              {list.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectProduct(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    (activeIndex % list.length) === idx ? 'w-8 bg-gold' : 'w-2 bg-charcoal-700 hover:bg-gold/50'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
          <span className="text-stone-warm text-[11px]">
            Showing {(activeIndex % list.length) + 1} of {list.length} Signature Masterpieces
          </span>
        </div>
      </div>
    </section>
  );
}
