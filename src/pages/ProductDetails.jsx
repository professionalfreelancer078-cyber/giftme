import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingBag,
  Star,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Check,
  Sparkles,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  Heart,
  Share2
} from 'lucide-react';
import { fetchProducts, fetchReviews, createReview } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getProductSlug } from '../lib/slug';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [shareToast, setShareToast] = useState(false);

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // User selections
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [customText, setCustomText] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Review submission form state
  const [revName, setRevName] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revText, setRevText] = useState('');
  const [revSubmitting, setRevSubmitting] = useState(false);
  const [revToast, setRevToast] = useState({ show: false, type: '', msg: '' });

  // Quick Buy Modal State
  const [showQuickBuyModal, setShowQuickBuyModal] = useState(false);
  const [quickForm, setQuickForm] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    pincode: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    async function loadData() {
      setLoading(true);
      try {
        const [prodList, revList] = await Promise.all([
          fetchProducts(),
          fetchReviews()
        ]);
        const mappedList = (prodList || []).map((p) => ({
          ...p,
          id: p.id,
          name: p.product_name || p.name || 'GiftMe Signature Keychain',
          price: Number(p.offer_price !== undefined ? p.offer_price : (p.price || 0)),
          originalPrice: Number(p.original_price !== undefined ? p.original_price : (p.originalPrice || 0)),
          description: p.description || p.shortDescription || '',
          images: p.images || [p.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
          category: p.category || 'Luxury Key Holder',
          rating: p.rating || 4.9,
          reviewCount: p.reviewCount || 128
        }));

        setAllProducts(mappedList);

        // Find matching product by ID or slug
        const param = id ? id.toString().toLowerCase().trim() : '';
        const found = mappedList.find((p) => {
          const prodId = p.id ? p.id.toString().toLowerCase() : '';
          const prodSlug = getProductSlug(p);
          if (prodSlug && prodSlug === param) return true;
          if (prodId === param || prodId.endsWith(param) || param.endsWith(prodId)) return true;
          return false;
        });
        if (found) {
          setProduct(found);
          const cleanSlug = getProductSlug(found);
          if (cleanSlug && id !== cleanSlug && id === found.id?.toString()) {
            window.history.replaceState(null, '', `/product/${cleanSlug}`);
          }
        } else {
          setProduct(null);
        }

        // Filter reviews for this product
        setReviews((revList || []).filter(r => !found || r.product_id === found.id || true));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12 animate-pulse">
        <div className="h-6 w-32 bg-cream-300 rounded-xl"></div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 h-96 bg-cream-200 rounded-3xl"></div>
          <div className="lg:col-span-5 h-96 bg-cream-200 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-serif text-2xl font-bold text-charcoal mb-4">Product Specification Not Found</h2>
        <Link to="/shop" className="btn-primary inline-flex text-xs">Return to Catalog</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.product_name || product.name,
      price: Number(product.offer_price || product.price || 0),
      originalPrice: Number(product.original_price || product.originalPrice || 0),
      images: product.images || [product.image_url]
    }, quantity, '', customText);
  };

  const handleBuyNow = () => {
    setShowQuickBuyModal(true);
  };

  const handleQuickBuySubmit = (e) => {
    e.preventDefault();
    if (!quickForm.name || !quickForm.mobile || !quickForm.address) {
      alert("Please fill in all mandatory customer & delivery details.");
      return;
    }
    const prodName = product.product_name || product.name || 'GiftMe Signature Keychain';
    const priceVal = Number(product.offer_price !== undefined ? product.offer_price : (product.price || 0));
    const totalVal = priceVal * quantity;

    const message = `Hello GiftMe! I want to place an immediate order via Quick Buy:\n\n*Customer Details:*\nName: ${quickForm.name}\nMobile: ${quickForm.mobile}\nDelivery Address: ${quickForm.address}${quickForm.city ? `, ${quickForm.city}` : ''}${quickForm.pincode ? ` - ${quickForm.pincode}` : ''}\n\n*Order Summary:*\n• ${prodName} (Qty: ${quantity}${customText ? `, Engraving: "${customText}"` : ''})\n\n*Total Payable:* ₹${totalVal.toLocaleString()}\n\nPlease confirm my order and payment details!`;

    const whatsappUrl = `https://wa.me/919444232904?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setShowQuickBuyModal(false);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!revName.trim() || !revText.trim()) {
      setRevToast({ show: true, type: 'error', msg: 'Please enter your name and review feedback.' });
      return;
    }
    setRevSubmitting(true);
    try {
      const newRev = await createReview({
        product_id: product.id,
        customer_name: revName,
        rating: Number(revRating),
        review: revText
      });
      setReviews(prev => [newRev, ...prev]);
      setRevName('');
      setRevText('');
      setRevRating(5);
      setRevToast({ show: true, type: 'success', msg: 'Thank you! Your verified review has been posted.' });
      setTimeout(() => setRevToast({ show: false, type: '', msg: '' }), 4000);
    } catch (err) {
      setRevToast({ show: true, type: 'error', msg: err.message || 'Failed to submit review.' });
    } finally {
      setRevSubmitting(false);
    }
  };

  const origPrice = Number(product.original_price || product.originalPrice || 0);
  const offerPrice = Number(product.offer_price || product.price || 0);
  const discountPct = origPrice > offerPrice ? Math.round(((origPrice - offerPrice) / origPrice) * 100) : 0;
  const isOutOfStock = product.in_stock === false || product.stock_status === 'Out of Stock' || product.in_stock === 'false';

  const relatedProducts = allProducts.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-stone-warm hover:text-charcoal transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </button>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-cream-200 border border-cream-300 shadow-luxury relative group">
            <img
              src={product.images?.[activeImageIndex] || product.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'}
              alt={product.product_name}
              className="w-full h-full object-contain p-6 transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3 pt-2">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all ${activeImageIndex === idx
                      ? 'border-gold bg-cream-200'
                      : 'border-transparent bg-cream-100 hover:border-cream-400'
                    }`}
                >
                  <img src={imgUrl} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gold-700 bg-cream-300/80 px-3 py-1 rounded-full">
                {product.category || 'Luxury Key Holder'}
              </span>
              {isOutOfStock && (
                <span className="text-[11px] font-bold uppercase tracking-widest text-red-600 bg-red-100 border border-red-200 px-3 py-1 rounded-full">
                  🔴 Out of Stock
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal mt-3">
              {product.product_name || product.name}
            </h1>
          </div>

          {/* Price Banner */}
          <div className="p-4 rounded-2xl bg-cream-200/80 border border-cream-300 flex items-baseline justify-between">
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-3xl font-bold text-charcoal">₹{offerPrice.toLocaleString()}</span>
              {origPrice > offerPrice && (
                <span className="text-sm font-semibold text-stone-warm line-through">₹{origPrice.toLocaleString()}</span>
              )}
            </div>
            {discountPct > 0 && (
              <span className="bg-charcoal text-gold text-xs font-bold px-2.5 py-1 rounded-lg">
                Save {discountPct}%
              </span>
            )}
          </div>

          <p className="text-xs text-stone-warm leading-relaxed">
            {product.description || 'Artisanal key holder engineered from premium hardware for lifetime elegance.'}
          </p>


          {/* Quantity */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-charcoal">Quantity:</span>
            <div className="flex items-center border border-cream-300 rounded-xl bg-cream-200">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3.5 py-2 font-bold text-stone-warm hover:text-charcoal">-</button>
              <span className="w-8 text-center text-xs font-bold text-charcoal">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3.5 py-2 font-bold text-stone-warm hover:text-charcoal">+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            {isOutOfStock ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-center">
                <span className="text-xs font-bold text-red-600 block mb-1">This Product is Currently Sold Out</span>
                <span className="text-[11px] text-stone-warm">Please check back later or explore other luxury pieces in our collection.</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="btn-secondary w-full py-4 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" /> Add to Bag
                </button>
                <button
                  onClick={handleBuyNow}
                  className="btn-gold w-full py-4 text-xs font-bold shadow-luxury flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-charcoal-950" /> Buy Now (WhatsApp)
                </button>
              </div>
            )}

            {/* Wishlist & Share Row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`py-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${isWishlisted(product.id)
                    ? 'bg-red-50 border-red-400 text-red-500'
                    : 'border-cream-400 text-stone-warm hover:border-red-400 hover:text-red-500'
                  }`}
              >
                <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-red-500' : ''}`} />
                {isWishlisted(product.id) ? 'Wishlisted ♥' : 'Add to Wishlist'}
              </button>

              <div className="relative">
                <button
                  onClick={async () => {
                    const url = window.location.href;
                    const title = product.product_name || product.name || 'GiftMe Luxury Piece';
                    const text = `Check out ${title} on GiftMe!`;

                    // 1. Try Native Web Share API first (works on iOS Safari / Android Chrome over HTTPS)
                    if (navigator.share) {
                      try {
                        await navigator.share({ title, text, url });
                        return; // Successfully opened native share menu!
                      } catch (err) {
                        // If user closed/aborted the share sheet, do nothing
                        if (err.name === 'AbortError' || err.message?.toLowerCase().includes('abort')) {
                          return;
                        }
                        // Otherwise fall through to clipboard copy
                      }
                    }

                    // 2. Bulletproof Clipboard Copy (works on ALL mobile browsers & HTTP dev servers)
                    let copied = false;
                    try {
                      if (navigator?.clipboard?.writeText) {
                        await navigator.clipboard.writeText(url);
                        copied = true;
                      }
                    } catch (err) {
                      // clipboard API failed (common on mobile HTTP / non-secure contexts)
                    }

                    // 3. Fallback to execCommand if modern clipboard API failed or is undefined
                    if (!copied) {
                      try {
                        const textArea = document.createElement('textarea');
                        textArea.value = url;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-999999px';
                        textArea.style.top = '-999999px';
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        copied = document.execCommand('copy');
                        textArea.remove();
                      } catch (e) {
                        console.error('Fallback copy failed', e);
                      }
                    }

                    // Show visual feedback
                    setShareToast(true);
                    setTimeout(() => setShareToast(false), 2500);
                  }}
                  className="w-full py-3 rounded-xl border border-cream-400 text-stone-warm text-xs font-semibold flex items-center justify-center gap-2 hover:border-gold hover:text-gold transition-all cursor-pointer"
                >
                  {shareToast ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  {shareToast ? 'Link Copied!' : 'Share Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-cream-300 pt-16 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold font-semibold">Complete Your Collection</span>
            <h3 className="font-serif font-bold text-2xl sm:text-3xl text-charcoal">You May Also Like</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((relProd) => (
              <ProductCard key={relProd.id} product={relProd} />
            ))}
          </div>
        </div>
      )}

      {/* Customer Reviews & Submission Section */}
      <div className="border-t border-cream-300 pt-16 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase tracking-widest text-gold font-semibold">Patron Feedback</span>
          <h3 className="font-serif font-bold text-2xl text-charcoal">Verified Customer Reviews</h3>
          <p className="text-xs text-stone-warm">Only Name, Star Rating, and Text are permitted. Media attachments are disabled by store security policy.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Review Submission Form */}
          <div className="lg:col-span-5 bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm space-y-4 h-fit">
            <h4 className="font-serif font-bold text-base text-charcoal">Leave a Review</h4>

            {revToast.show && (
              <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${revToast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                }`}>
                {revToast.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{revToast.msg}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  placeholder="e.g. Vikramaditya Rao"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Rating (1 to 5 Stars) *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRevRating(star)}
                      className="p-1.5 rounded-lg hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= revRating ? 'fill-amber-500 text-amber-500' : 'text-cream-400'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-charcoal ml-2">{revRating} / 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Your Review Feedback *</label>
                <textarea
                  rows="3"
                  required
                  value={revText}
                  onChange={(e) => setRevText(e.target.value)}
                  placeholder="Share your experience with the craftsmanship and hardware quality..."
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={revSubmitting}
                className="w-full bg-charcoal hover:bg-gold hover:text-charcoal-950 text-cream-100 py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> {revSubmitting ? 'Submitting...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-7 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-cream-100 rounded-3xl border border-cream-300 p-12 text-center space-y-2">
                <Star className="w-10 h-10 text-cream-400 mx-auto" />
                <p className="text-xs font-semibold text-stone-warm">No patron reviews yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-cream-100 p-6 rounded-2xl border border-cream-300 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-charcoal">{rev.customer_name}</h5>
                      <div className="flex items-center gap-1 text-[10px] text-stone-warm mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(rev.created_at || Date.now()).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-3.5 h-3.5 ${idx < rev.rating ? 'fill-amber-500' : 'text-cream-400'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-warm leading-relaxed italic">"{rev.review}"</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Buy WhatsApp Modal */}
      {showQuickBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-8 max-w-lg w-full shadow-luxury space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cream-300 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-700">Instant Dispatch</span>
                <h3 className="font-serif text-xl font-bold text-charcoal">Quick WhatsApp Checkout</h3>
              </div>
              <button
                onClick={() => setShowQuickBuyModal(false)}
                className="p-2 text-stone-warm hover:text-charcoal rounded-full hover:bg-cream-200 transition-colors font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-cream-200 p-4 rounded-2xl border border-cream-300 flex items-center gap-4 text-xs">
              <img
                src={product.images?.[0] || product.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'}
                alt={product.product_name}
                className="w-14 h-14 object-cover rounded-xl bg-cream-100 border border-cream-300 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-charcoal truncate">{product.product_name || product.name}</h4>
                <p className="text-stone-warm text-[11px]">Category: <span className="font-semibold text-charcoal">{product.category || 'Luxury Key Holder'}</span> | Qty: <span className="font-semibold text-charcoal">{quantity}</span></p>
                {customText && <p className="text-stone-warm text-[11px] truncate">Engraving: <span className="italic">"{customText}"</span></p>}
                <p className="font-serif font-bold text-gold-700 mt-1">₹{(Number(product.offer_price !== undefined ? product.offer_price : (product.price || 0)) * quantity).toLocaleString()}</p>
              </div>
            </div>

            <form onSubmit={handleQuickBuySubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={quickForm.name}
                  onChange={(e) => setQuickForm({ ...quickForm, name: e.target.value })}
                  placeholder="e.g. Siddharth Mehta"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Mobile / WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  value={quickForm.mobile}
                  onChange={(e) => setQuickForm({ ...quickForm, mobile: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal mb-1">Delivery Address (Street / Flat / Area) *</label>
                <input
                  type="text"
                  required
                  value={quickForm.address}
                  onChange={(e) => setQuickForm({ ...quickForm, address: e.target.value })}
                  placeholder="e.g. 91, Dhanushkodipuram Street"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={quickForm.city}
                    onChange={(e) => setQuickForm({ ...quickForm, city: e.target.value })}
                    placeholder="e.g. Chennai"
                    className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    value={quickForm.pincode}
                    onChange={(e) => setQuickForm({ ...quickForm, pincode: e.target.value })}
                    placeholder="e.g. 600001"
                    className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowQuickBuyModal(false)}
                  className="flex-1 py-3.5 rounded-xl border border-cream-400 text-charcoal text-xs font-semibold hover:bg-cream-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3.5 px-6 rounded-xl bg-gold hover:bg-gold-400 text-charcoal-950 font-bold text-xs shadow-luxury transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-charcoal-950" />
                  Send Order to WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
