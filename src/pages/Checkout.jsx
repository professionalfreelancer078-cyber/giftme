import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, CreditCard, CheckCircle2, Truck, ArrowLeft, Sparkles, Key, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    city: '',
    pincode: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(null);

  const shippingCost = 0;
  const finalAmount = cartTotal;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C8A951', '#161617', '#FAF6F0', '#D8BC98']
    });
  };

  const handleWhatsAppCheckout = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.mobile || !formData.address) {
      alert("Please fill in all mandatory delivery details.");
      return;
    }

    setIsProcessing(true);

    const itemsSummary = cartItems
      .map(item => `• ${item.product.name} (Qty: ${item.quantity}${item.customText ? `, Engraving: "${item.customText}"` : ''})`)
      .join('\n');

    const message = `Hello GiftMe! I want to buy these products and place an order:\n\n*Customer Details:*\nName: ${formData.name}\nMobile: ${formData.mobile}${formData.email ? `\nEmail: ${formData.email}` : ''}\nDelivery Address: ${formData.address}, ${formData.city} - ${formData.pincode}\n\n*Order Summary:*\n${itemsSummary}\n\n*Total Payable:* ₹${finalAmount.toLocaleString()}\n\nPlease confirm my order and payment details!`;

    const whatsappUrl = `https://wa.me/919444232904?text=${encodeURIComponent(message)}`;

    setTimeout(() => {
      setIsProcessing(false);
      window.open(whatsappUrl, '_blank');
      completeMockOrder();
    }, 600);
  };

  const completeMockOrder = () => {
    setIsProcessing(false);
    const orderId = `GIFTME-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderCompleted({
      orderId,
      date: new Date().toLocaleDateString(),
    });
    clearCart();
    triggerConfetti();
  };

  if (orderCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-fade-in pb-24">
        <div className="w-20 h-20 rounded-full bg-gold/20 text-gold-700 flex items-center justify-center mx-auto border-2 border-gold shadow-luxury">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-700">Order Request Sent</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Thank You for Your Patronage, {formData.name}
          </h1>
          <p className="text-sm text-stone-warm max-w-xl mx-auto leading-relaxed">
            Your order request has been sent via WhatsApp! You can proceed in WhatsApp for further details, payment, and order confirmation.
          </p>
        </div>

        <div className="bg-cream-200/80 p-8 rounded-3xl border border-cream-300 text-left max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="flex justify-between text-xs border-b border-cream-300 pb-3">
            <span className="text-stone-warm">Order Reference</span>
            <strong className="font-mono text-charcoal">{orderCompleted.orderId}</strong>
          </div>
          <div className="flex justify-between text-xs border-b border-cream-300 pb-3">
            <span className="text-stone-warm">Payment Method</span>
            <strong className="font-semibold text-charcoal">WhatsApp Concierge (Pay on Confirmation)</strong>
          </div>
          <div className="flex justify-between text-xs border-b border-cream-300 pb-3">
            <span className="text-stone-warm">Delivery Destination</span>
            <strong className="text-charcoal text-right max-w-[200px] truncate">{formData.address}, {formData.city}</strong>
          </div>
          <div className="flex justify-between text-sm pt-1">
            <span className="font-bold text-charcoal">Total Payable</span>
            <span className="font-serif font-bold text-gold-700">₹{finalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-charcoal text-cream-100 p-6 rounded-2xl max-w-lg mx-auto text-xs space-y-2 text-left">
          <p className="font-semibold text-gold flex items-center gap-2">
            <Key className="w-4 h-4" /> Next Steps in WhatsApp
          </p>
          <p className="text-stone-warm leading-relaxed">
            Please check your WhatsApp chat window with our concierge. Our team will review your order details, confirm product availability or custom engraving, and assist you with secure payment options.
          </p>
        </div>

        <div className="pt-4">
          <Link to="/shop" className="btn-primary text-xs px-8 py-4 inline-flex">
            Continue Exploring Collection
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Your Bag is Empty</h2>
        <p className="text-sm text-stone-warm">Please add products to your bag before proceeding to checkout.</p>
        <Link to="/shop" className="btn-primary inline-flex text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24">
      <div className="flex items-center justify-between border-b border-cream-300 pb-6">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-700">Secure Portal</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-1">Order Checkout</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-charcoal bg-cream-200 px-4 py-2 rounded-xl">
          <Lock className="w-4 h-4 text-gold-700" />
          <span>256-Bit SSL Encryption</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Shipping & Customer Details Form */}
        <div className="lg:col-span-7 bg-cream-100 p-8 sm:p-10 rounded-3xl border border-cream-300 shadow-2xs space-y-8">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-charcoal">Delivery Credentials</h3>
            <p className="text-xs text-stone-warm">Enter your shipping details for express courier dispatch.</p>
          </div>

          <form onSubmit={handleWhatsAppCheckout} id="checkout-form" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2">Customer Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Siddharth Mehta"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2">Mobile Number *</label>
                <input
                  type="tel"
                  name="mobile"
                  required
                  pattern="[0-9]{10}"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  placeholder="10-digit Indian number"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-2">Email Address <span className="text-stone-warm font-normal">(For receipt & tracking)</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="siddharth@example.com"
                className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-2">Detailed Shipping Address *</label>
              <textarea
                name="address"
                required
                rows="3"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Flat / House No., Apartment name, Street, Landmark"
                className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2">City / District *</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Pune"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2">PIN Code *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  pattern="[0-9]{6}"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit postal code"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary & Payment Button */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-cream-200/90 p-8 rounded-3xl border border-cream-300 space-y-6 shadow-luxury">
            <h3 className="font-serif text-xl font-bold text-charcoal">Order Summary</h3>

            {/* Items review */}
            <div className="max-h-60 overflow-y-auto divide-y divide-cream-300 pr-2">
              {cartItems.map((item) => (
                <div key={item.cartItemId} className="py-3 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-cream-300" />
                    <div>
                      <p className="font-semibold text-charcoal line-clamp-1 max-w-[150px]">{item.product.name}</p>
                      <p className="text-[10px] text-stone-warm">Qty: {item.quantity}{item.customText ? ` • Engraving: "${item.customText}"` : ''}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-charcoal">₹{(item.product.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 border-t border-cream-300 text-xs text-stone-warm">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-charcoal">₹{cartTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-cream-300">
              <span className="font-serif font-bold text-lg text-charcoal">Final Payable</span>
              <span className="font-serif font-bold text-2xl text-charcoal">₹{finalAmount.toLocaleString()}</span>
            </div>

            {/* WhatsApp Checkout Button */}
            <button
              form="checkout-form"
              type="submit"
              disabled={isProcessing}
              className="w-full bg-gold hover:bg-gold-400 text-charcoal-950 py-4 rounded-xl font-bold text-sm tracking-wide transition-all shadow-luxury flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin"></span>
                  Connecting WhatsApp Concierge...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 fill-charcoal-950" />
                  Order ₹{finalAmount.toLocaleString()} via WhatsApp
                </>
              )}
            </button>

            {/* Payment Modes Accepted */}
            <div className="pt-2 text-center space-y-2">
              <p className="text-[10px] text-stone-warm uppercase tracking-wider font-semibold">
                Accepted Payment Methods
              </p>
              <div className="flex items-center justify-center gap-4 text-xs font-semibold text-charcoal">
                <span className="bg-cream-100 px-2.5 py-1 rounded border border-cream-300">UPI / GPay / PhonePe</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
