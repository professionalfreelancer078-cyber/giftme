import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const { cartItems, isCartDrawerOpen, setIsCartDrawerOpen, removeFromCart, updateQuantity, cartTotal, cartCount } = useCart();
  const navigate = useNavigate();

  if (!isCartDrawerOpen) return null;

  const freeShippingThreshold = 0;
  const progressToFreeShipping = 100;
  const remainingForFreeShipping = 0;

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/checkout');
  };

  const handleViewCartPage = () => {
    setIsCartDrawerOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartDrawerOpen(false)}
        className="absolute inset-0 bg-charcoal/40 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-cream-100 shadow-luxury-hover border-l border-cream-300 flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-cream-300 flex items-center justify-between bg-cream-100">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 rounded-xl bg-charcoal text-gold flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-charcoal">Your Shopping Bag</h2>
                <span className="text-xs text-stone-warm">{cartCount} items selected</span>
              </div>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-2 rounded-xl text-stone-warm hover:text-charcoal hover:bg-cream-200 transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>



          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-cream-200">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-cream-200 flex items-center justify-center text-stone-warm mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-serif font-semibold text-lg text-charcoal mb-1">Your bag is empty</h3>
                <p className="text-xs text-stone-warm max-w-xs mb-6">
                  Discover luxury leather key holders and precision architectural keychains.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigate('/shop');
                  }}
                  className="btn-gold px-6 py-3 text-xs"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.cartItemId} className="py-4 flex gap-3 sm:gap-4 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-cream-300 shrink-0 bg-cream-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif font-semibold text-sm text-charcoal truncate">
                      {item.product.name}
                    </h4>
                    {item.customText && (
                      <p className="text-[11px] text-gold-700 font-medium mt-0.5 truncate">Engraving: "{item.customText}"</p>
                    )}
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <div className="flex items-center border border-cream-300 rounded-lg bg-cream-200/50 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 px-2 text-stone-warm hover:text-charcoal transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold px-2 text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 px-2 text-stone-warm hover:text-charcoal transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="font-serif font-bold text-sm text-charcoal shrink-0">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2 text-stone-warm hover:text-red-600 transition-colors self-start shrink-0"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 bg-cream-200 border-t border-cream-300">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs text-stone-warm">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal">₹{cartTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-base font-serif font-bold text-charcoal pt-2 border-t border-cream-300">
                  <span>Total Estimated</span>
                  <span>₹{cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={handleProceedToCheckout}
                  className="btn-primary w-full py-4 text-sm font-semibold shadow-luxury flex items-center justify-center gap-2"
                >
                  Proceed to Secure Checkout <ArrowRight className="w-4 h-4 shrink-0" />
                </button>
                <button
                  onClick={handleViewCartPage}
                  className="py-3 w-full text-xs font-semibold text-charcoal hover:text-gold-700 transition-colors text-center"
                >
                  View Detailed Shopping Bag
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-stone-warm mt-4 text-center flex-wrap">
                <ShieldCheck className="w-3.5 h-3.5 text-gold shrink-0" />
                <span>256-Bit Encrypted Payment &bull; Spring Boot Ready</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
