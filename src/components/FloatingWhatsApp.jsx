import React, { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    const phone = "919444232904";
    const defaultText = message.trim() || "Hi GiftMe team, I would like to inquire about artisanal key holders and custom engraving options.";
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(defaultText)}`;
    window.open(url, '_blank');
    setMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Popup Dialog */}
      {isOpen && (
        <div className="mb-4 w-80 bg-cream-100 rounded-2xl shadow-luxury border border-cream-300 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-charcoal text-cream-100 p-4 flex items-center justify-between border-b border-gold/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-gold/60 shadow-sm shrink-0 bg-charcoal">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  src="/assets/intro-video.mp4"
                  className="w-full h-full object-cover scale-105"
                />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-cream-100">GiftMe Concierge</h4>
                <p className="text-[10px] text-gold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span> Online &bull; Replies instantly
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-cream-300 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-cream-200/50 space-y-3">
            <div className="bg-cream-100 p-3 rounded-xl border border-cream-300 shadow-2xs text-xs text-charcoal leading-relaxed">
              👋 Hello! Welcome to **GiftMe**. Looking for custom monogramming or corporate bulk gifting? Ask us anything!
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSendWhatsApp} className="p-3 bg-cream-100 border-t border-cream-300 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your inquiry here..."
              className="flex-1 bg-cream-200 border border-cream-300 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-gold"
            />
            <button
              type="submit"
              className="bg-[#25D366] hover:bg-[#20bd5a] text-white p-2.5 rounded-xl transition-all flex items-center justify-center shadow-xs"
              title="Start Chat"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button with Looping Intro Video */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-charcoal-950 border-2 border-gold shadow-[0_0_20px_rgba(200,169,81,0.6)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all relative group overflow-visible cursor-pointer"
        aria-label="WhatsApp Concierge Support"
      >
        <div className="w-full h-full rounded-full overflow-hidden relative">
          <video
            autoPlay
            loop
            muted
            playsInline
            src="/assets/intro-video.mp4"
            className="w-full h-full object-cover scale-105 pointer-events-none select-none"
          />
        </div>
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-gold rounded-full border-2 border-cream-100 animate-pulse z-10"></span>
        <span className="absolute right-16 sm:right-20 px-3 py-1.5 bg-charcoal text-cream-100 text-xs rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-sm pointer-events-none font-medium z-10">
          Chat with Concierge
        </span>
      </button>
    </div>
  );
}
