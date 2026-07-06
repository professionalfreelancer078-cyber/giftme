import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Heart, Sparkles, ArrowRight } from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="space-y-24 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4 animate-fade-in">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-700">The Story of GiftMe</span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-charcoal leading-tight">
          Elevating Everyday Carry to a Living Art.
        </h1>
        <p className="text-stone-warm text-base sm:text-lg font-light leading-relaxed">
          Born from a desire to strip away bulky, jingling metal rings and replace them with intentional tactile architecture.
        </p>
      </div>

      {/* Hero Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-luxury border border-cream-300">
          <img
            src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1000"
            alt="Artisanal Leather Craftsmanship"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-6 md:pl-6">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-gold-700">Artisanal Heritage</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
            Full-Grain Tuscan Tannery & Precision Metallurgy
          </h2>
          <p className="text-sm text-stone-warm leading-relaxed">
            Every GiftMe creation begins in Santa Croce sull'Arno, Tuscany, where vegetable-tanned hides are slowly infused with natural tannins and organic tree bark extracts. Unlike synthetic leathers that crack within months, our hides absorb the oils of your hand, evolving into a rich, personalized patina over years of faithful service.
          </p>
          <p className="text-sm text-stone-warm leading-relaxed">
            For our hardware, we turn to cold-forged naval brass and aerospace titanium. Each carabiner gate and tension bolt is engineered to withstand over 50,000 actuations without losing a gram of spring retention.
          </p>
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        <div className="bg-cream-200/70 p-8 rounded-3xl border border-cream-300 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal text-gold flex items-center justify-center shadow-sm">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-charcoal">Uncompromising Materials</h3>
          <p className="text-xs text-stone-warm leading-relaxed">
            No zinc die-casting or artificial PU leather. Only genuine full-grain hides, solid machined brass, and 3K carbon fiber weaves.
          </p>
        </div>

        <div className="bg-cream-200/70 p-8 rounded-3xl border border-cream-300 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal text-gold flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-charcoal">Silent Engineering</h3>
          <p className="text-xs text-stone-warm leading-relaxed">
            Our smart organizers and magnetic wall docks are designed to eliminate key jingle and scratched phone screens forever.
          </p>
        </div>

        <div className="bg-cream-200/70 p-8 rounded-3xl border border-cream-300 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-charcoal text-gold flex items-center justify-center shadow-sm">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-charcoal">The Perfect Gift Experience</h3>
          <p className="text-xs text-stone-warm leading-relaxed">
            Every piece arrives nestled in our signature GiftMe presentation box with complimentary custom diamond engraving.
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-charcoal text-cream-100 rounded-3xl p-12 text-center space-y-6 shadow-luxury">
        <Sparkles className="w-8 h-8 text-gold mx-auto" />
        <h2 className="font-serif text-3xl sm:text-4xl font-bold">Ready to Upgrade Your Everyday Carry?</h2>
        <p className="text-sm text-stone-warm max-w-xl mx-auto">
          Explore our collection of artisanal leather keychains and architectural wall key holders today.
        </p>
        <div className="pt-2">
          <Link to="/shop" className="btn-gold inline-flex px-8 py-4 text-sm">
            Explore Collection <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
