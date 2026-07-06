import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, ShieldCheck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const freeShippingThreshold = 1499;
  const shippingCost = cartTotal >= freeShippingThreshold || cartTotal === 0 ? 0 : 99;
  const finalTotal = Math.max(0, cartTotal - discount + shippingCost);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'GIFTME10' || couponCode.toUpperCase() === 'VIP10') {
      const calcDiscount = Math.round(cartTotal * 0.1);
      setDiscount(calcDiscount);
      setCouponApplied(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid code. Try "GIFTME10" for 10% privilege discount.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-cream-200 flex items-center justify-center text-stone-warm mx-auto">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-charcoal">Your Shopping Bag is Empty</h1>
        <p className="text-sm text-stone-warm max-w-sm mx-auto">
          Explore our collection of full-grain Tuscan leather keychains and precision magnetic wall holders.
        </p>
        <Link to="/shop" className="btn-primary inline-flex text-xs px-8 py-4">
          Discover Key Holders <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-20">
      <div className="text-left">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-700">Review Selection</span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">Detailed Shopping Bag</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Items List */}
        <div className="lg:col-span-8 bg-cream-100 rounded-3xl border border-cream-300 overflow-hidden shadow-2xs divide-y divide-cream-200">
          {cartItems.map((item) => (
            <div key={item.cartItemId} className="p-6 flex flex-col sm:flex-row gap-6 items-center">
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-28 h-28 rounded-2xl object-cover bg-cream-200 border border-cream-300 flex-shrink-0"
              />
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <span className="text-[10px] uppercase tracking-wider text-stone-warm">{item.product.category}</span>
                <h3 className="font-serif font-bold text-base text-charcoal">{item.product.name}</h3>
                {item.customText && (
                  <p className="text-xs text-gold-700 font-medium">Engraving: "{item.customText}"</p>
                )}
                <div className="pt-2 sm:hidden flex justify-center">
                  <span className="font-serif font-bold text-base text-charcoal">₹{item.product.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-6">
                <div className="flex items-center border border-cream-300 rounded-xl bg-cream-200">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                    className="px-3 py-2 text-stone-warm hover:text-charcoal font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-charcoal">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                    className="px-3 py-2 text-stone-warm hover:text-charcoal font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="hidden sm:block text-right min-w-[80px]">
                  <span className="font-serif font-bold text-base text-charcoal">
                    ₹{(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="p-2.5 rounded-xl text-stone-warm hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-cream-200/80 p-8 rounded-3xl border border-cream-300 space-y-6 shadow-luxury">
            <h3 className="font-serif text-xl font-bold text-charcoal">Order Breakdown</h3>

            {/* Privilege Coupon */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-semibold text-charcoal flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-gold-700" /> Privilege Coupon Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter GIFTME10"
                  disabled={couponApplied}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-cream-100 border border-cream-300 text-xs text-charcoal uppercase placeholder:normal-case focus:outline-none focus:border-gold disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={couponApplied}
                  className="bg-charcoal hover:bg-gold hover:text-charcoal-950 text-cream-100 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
              {couponApplied && (
                <p className="text-xs text-gold-700 font-semibold flex items-center gap-1">
                  ✨ Privilege coupon applied successfully (-₹{discount.toLocaleString()})
                </p>
              )}
              {errorMsg && <p className="text-xs text-red-600 font-medium">{errorMsg}</p>}
            </form>

            <div className="space-y-3 pt-4 border-t border-cream-300 text-xs text-stone-warm">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-charcoal">₹{cartTotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-gold-700 font-semibold">
                  <span>Privilege Discount</span>
                  <span>-₹{discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Shipping</span>
                <span className="font-semibold text-charcoal">
                  {shippingCost === 0 ? 'Complimentary (FREE)' : `₹${shippingCost}`}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-cream-300">
              <span className="font-serif font-bold text-lg text-charcoal">Total Amount</span>
              <span className="font-serif font-bold text-2xl text-charcoal">₹{finalTotal.toLocaleString()}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full py-4 text-sm font-semibold shadow-luxury"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-stone-warm pt-2">
              <ShieldCheck className="w-4 h-4 text-gold" />
              <span>WhatsApp Concierge Verified Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
