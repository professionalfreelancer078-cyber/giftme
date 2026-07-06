import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Key, Send, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-charcoal text-cream-200 pt-16 pb-12 border-t border-cream-300">
      {/* Brand Value Props Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 pb-12 border-b border-charcoal-800 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center text-gold flex-shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-cream-100 text-sm">Express Pan-India Delivery</h4>
            <p className="text-xs text-stone-warm mt-0.5">Complimentary shipping over ₹1,499</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center text-gold flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-cream-100 text-sm">Lifetime Hardware Guarantee</h4>
            <p className="text-xs text-stone-warm mt-0.5">Solid brass & titanium hardware</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center text-gold flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-cream-100 text-sm">Custom Artisan Engraving</h4>
            <p className="text-xs text-stone-warm mt-0.5">Personalized initials & coordinates</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-charcoal-800 flex items-center justify-center text-gold flex-shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-semibold text-cream-100 text-sm">Hassle-Free Exchanges</h4>
            <p className="text-xs text-stone-warm mt-0.5">14-day seamless replacement policy</p>
          </div>
        </div>
      </div>


      {/* Main Footer Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Brand Column */}
        <div className="col-span-1 md:col-span-6 flex flex-col gap-4 pr-0 md:pr-8">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="/assets/logo.png"
              alt="GiftMe Logo"
              className="w-24 h-24 rounded-full object-cover border-2 border-yellow-500 shadow-lg"
            />
          </Link>
          <p className="text-sm text-stone-warm leading-relaxed">
            GiftMe elevates everyday carry into a refined tactile ritual. We blend full-grain Tuscan leathers, architectural hardwood, and precision aerospace hardware to design key holders built for a lifetime.
          </p>
          <div className="flex gap-3 pt-2">
            <span className="px-3 py-1 bg-charcoal-800 text-[11px] rounded-full border border-charcoal-700 text-gold font-medium">
              Spring Boot Ready
            </span>
            <span className="px-3 py-1 bg-charcoal-800 text-[11px] rounded-full border border-charcoal-700 text-gold font-medium">
              Supabase Verified
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="col-span-1 md:col-span-3">
          <h4 className="font-serif font-semibold text-cream-100 mb-4 tracking-wide">Collection</h4>
          <ul className="space-y-2.5 text-sm text-stone-warm">
            <li><Link to="/shop" className="hover:text-gold transition-colors">All Key Holders</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition-colors">Cartoon Keychains</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition-colors">Baby toys</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition-colors">Night lights</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition-colors">water Bottles</Link></li>
          </ul>
        </div>

        {/* Customer Care */}
        <div className="col-span-1 md:col-span-3">
          <h4 className="font-serif font-semibold text-cream-100 mb-4 tracking-wide">Customer Care</h4>
          <ul className="space-y-2.5 text-sm text-stone-warm">
            <li><Link to="/contact" className="hover:text-gold transition-colors">WhatsApp Helpdesk</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Order Status</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Warranty Claim</Link></li>
            <li><Link to="/contact" className="hover:text-gold transition-colors">Corporate Gifting</Link></li>
          </ul>
        </div>
      </div>

      {/* Newsletter Column */}


      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-charcoal-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-warm">
        <p>&copy; {new Date().getFullYear()} GiftMe Luxury Everyday Carry Pvt Ltd. Crafted with precision.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 font-medium text-cream-200">
            Secured 256-Bit SSL & Verified WhatsApp Concierge
          </span>
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
          <div>
            <span>DESIGNED BY KAVINRAJA A R</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
