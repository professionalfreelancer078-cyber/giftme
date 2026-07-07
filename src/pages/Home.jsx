import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Award, Heart, Star, MessageCircle, CheckCircle2 } from 'lucide-react';
import { products as localProducts, uploadedProducts } from '../data/products';
import { fetchProducts, fetchReviews } from '../lib/supabase';
import ProductCard from '../components/ProductCard';
import { getProductSlug } from '../lib/slug';
import UploadedShowcase from '../components/UploadedShowcase';

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0);
  const [catalog, setCatalog] = useState(localProducts);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => prev + 1);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchProducts();
        if (data && data.length > 0) {
          const mapped = data.map((p) => ({
            ...p,
            id: p.id,
            name: p.product_name || p.name,
            price: Number(p.offer_price || p.price || 0),
            originalPrice: Number(p.original_price || p.originalPrice || 0),
            shortDescription: p.description || p.shortDescription || '',
            images: p.images || [p.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
            badge: p.badge || p.category || 'Featured',
            created_at: p.created_at || new Date(0).toISOString()
          }));
          setCatalog(mapped);
        }
        const revs = await fetchReviews();
        if (revs && Array.isArray(revs)) {
          setReviews(revs);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const sortedByNewest = [...catalog].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return timeB - timeA;
  });

  const isProductInStock = (p) => p.in_stock !== false && p.stock_status !== 'Out of Stock' && p.in_stock !== 'false';
  const inStockSorted = sortedByNewest.filter(isProductInStock);

  const recentAdminProducts = inStockSorted.slice(0, 5);
  const fallbackUploaded = uploadedProducts.filter(isProductInStock);
  const heroProducts = recentAdminProducts.length > 0 ? recentAdminProducts : (fallbackUploaded.length > 0 ? fallbackUploaded : uploadedProducts);
  const activeHeroIdx = heroProducts.length > 0 ? heroIndex % heroProducts.length : 0;
  const currentHeroProduct = heroProducts[activeHeroIdx] || uploadedProducts[0];

  const newArrivals = sortedByNewest.slice(0, 4);

  const bestSellerList = catalog.filter((p) => p.badge?.includes('Best Seller') || (p.rating && p.rating >= 4.9));
  const bestSellers = bestSellerList.length >= 4 ? bestSellerList.slice(0, 4) : catalog.slice(0, 4);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-24 overflow-hidden bg-gradient-to-b from-cream-100 via-cream-200/50 to-cream-100 border-b border-cream-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-left z-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cream-200 border border-gold/40 text-charcoal text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span> ✨ Personalized Gifts for Every Occasion</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-charcoal leading-[1.08]">
              Unique Products <br />
              <span className="italic font-normal text-gold-700">Made Just for You.</span>
            </h1>

            <p className="text-stone-warm text-base sm:text-lg max-w-xl leading-relaxed font-light">
              Discover a wide range of quality products designed to make everyday life more special. Find something you'll love for yourself or as a thoughtful gift.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/shop" className="btn-primary text-sm px-8 py-4">
                Explore Collection <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/shop?category=Custom+Engraved" className="btn-secondary text-sm px-7 py-4">
                Personalized Engraving
              </Link>
            </div>

            {/* Micro Trust Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-cream-300 max-w-lg">
              <div>
                <p className="font-serif font-bold text-2xl text-charcoal">100+</p>
                <p className="text-xs text-stone-warm">Happy Customers</p>
              </div>
              <div>
                <p className="font-serif font-bold text-2xl text-charcoal">Premium</p>
                <p className="text-xs text-stone-warm">Quality Products</p>
              </div>
              <div>
                <p className="font-serif font-bold text-2xl text-charcoal">Fast</p>
                <p className="text-xs text-stone-warm">Delivery</p>
              </div>
            </div>
          </div>

          {/* Hero Image Showcase Cycling One by One */}
          <div className="lg:col-span-5 relative">
            <Link
              to={`/product/${getProductSlug(currentHeroProduct)}`}
              className="block relative z-10 aspect-[4/5] rounded-3xl overflow-hidden shadow-luxury-hover border-8 border-cream-100 bg-cream-200 group cursor-pointer"
            >
              <img
                key={currentHeroProduct.id}
                src={currentHeroProduct.images[0]}
                alt={currentHeroProduct.name}
                className="w-full h-full object-cover object-center transition-all duration-700 animate-fade-in group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent flex flex-col justify-end p-8 text-cream-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs uppercase tracking-widest text-gold font-semibold">
                    {currentHeroProduct.badge}
                  </span>
                  <span className="text-xs font-bold bg-gold/20 text-gold px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                    ₹{currentHeroProduct.price.toLocaleString()}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-bold leading-tight group-hover:text-gold transition-colors">
                  {currentHeroProduct.name.replace('GiftMe ', '')}
                </h3>
                <p className="text-xs text-cream-300 mt-1 line-clamp-1">
                  {currentHeroProduct.shortDescription}
                </p>
              </div>
            </Link>

            {/* Slide progress indicators */}
            <div className="absolute z-20 bottom-4 right-4 flex items-center gap-1.5 bg-charcoal/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-gold/30">
              {heroProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault();
                    setHeroIndex(idx);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${activeHeroIdx === idx ? 'w-6 bg-gold' : 'w-1.5 bg-cream-300/50 hover:bg-gold/60'
                    }`}
                  aria-label={`Show product ${idx + 1}`}
                />
              ))}
            </div>

            {/* Floating Badge overlay */}
            <div className="absolute -bottom-6 -left-6 z-20 bg-cream-100 p-4 rounded-2xl shadow-luxury border border-cream-300 flex items-center gap-3 animate-float hidden sm:flex">
              <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center text-gold-700 font-bold">
                ★
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal">{currentHeroProduct.rating || 5.0} / 5.0 Rating</p>
                <p className="text-[10px] text-stone-warm">Product {activeHeroIdx + 1} of {heroProducts.length} &bull; Click to View</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Signature Uploaded Products Showcase with Sliding Toggle Effect */}
      <UploadedShowcase products={recentAdminProducts} />

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-700">Most Loved</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">Best-Selling Key Holders</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-gold-700 mt-4 md:mt-0 group">
            Shop All Best Sellers <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {bestSellers.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-cream-200/60 p-8 sm:p-12 rounded-3xl border border-cream-300">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-700">Just Released</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">New Arrivals & Innovations</h2>
          </div>
          <Link to="/shop" className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal hover:text-gold-700 mt-4 md:mt-0 group">
            View New Drops <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Reviews Section - Only show when users have submitted reviews */}
      {reviews && reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-700">Testimonials</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2">Loved by Discerning Patrons</h2>
            <p className="text-sm text-stone-warm mt-3">Read verified experiences from our patrons across India.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.slice(0, 8).map((review) => {
              const reviewedProduct = catalog.find(p => p.id?.toString() === review.product_id?.toString() || p.id === review.product_id) || catalog[0];
              const productName = reviewedProduct ? (reviewedProduct.name || reviewedProduct.product_name) : 'Signature Key Holder';
              const targetUrl = reviewedProduct ? `/product/${getProductSlug(reviewedProduct)}` : (review.product_id ? `/product/${review.product_id}` : '/shop');

              return (
                <Link
                  key={review.id}
                  to={targetUrl}
                  className="bg-cream-100 p-6 rounded-2xl border border-cream-300 shadow-2xs flex flex-col justify-between hover:border-gold hover:shadow-luxury transition-all cursor-pointer group block"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(Number(review.rating) || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-gold-700 bg-gold/10 px-2.5 py-0.5 rounded-full group-hover:bg-gold group-hover:text-charcoal transition-colors flex items-center gap-1">
                        View Product →
                      </span>
                    </div>
                    <p className="text-xs text-charcoal italic leading-relaxed mb-4">
                      "{review.review || review.comment}"
                    </p>
                  </div>
                  <div>
                    <div className="pt-3 border-t border-cream-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-xs text-charcoal flex items-center gap-1">
                          {review.customer_name || review.name}
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-700 fill-gold-100" />
                        </h4>
                        {review.location && <span className="text-[10px] text-stone-warm">{review.location}</span>}
                      </div>
                      <span className="text-[10px] text-stone-warm font-medium">Verified Buyer</span>
                    </div>
                    <p className="text-[11px] font-medium text-charcoal-700 mt-3 flex items-center gap-1 bg-cream-200/70 p-2 rounded-lg border border-cream-300/60">
                      <span className="text-stone-warm text-[10px]">Reviewed:</span>
                      <span className="font-semibold text-charcoal group-hover:text-gold transition-colors line-clamp-1 text-xs">{productName}</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* WhatsApp Concierge Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-charcoal to-charcoal-800 rounded-3xl p-8 sm:p-14 text-cream-100 flex flex-col md:flex-row items-center justify-between gap-8 border border-gold/30 shadow-luxury">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="px-3 py-1 bg-gold/20 text-gold text-xs rounded-full font-semibold uppercase tracking-wider">
              Bespoke Concierge
            </span>
            <h3 className="font-serif text-2xl sm:text-4xl font-bold leading-tight">
              Looking for Custom Monograms or Corporate Gifting?
            </h3>
            <p className="text-xs sm:text-sm text-stone-warm leading-relaxed">
              Connect directly with our master leather craftsmen via WhatsApp. We offer custom logo engraving, luxury corporate gift boxes, and bulk order discounts.
            </p>
          </div>
          <a
            href="https://wa.me/919444232904?text=Hi%20GiftMe%2C%20I%20would%20like%20to%20discuss%20custom%20engraved%20keychains%20and%20corporate%20gifting."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center gap-3 whitespace-nowrap active:scale-95"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            Chat on WhatsApp Now
          </a>
        </div>
      </section>
    </div>
  );
}
