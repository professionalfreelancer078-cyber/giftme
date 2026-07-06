import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function ContactUs() {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
    }
  };

  const faqs = [
    {
      question: "How long does custom engraving take?",
      answer: "Custom monogramming and diamond engraving is performed in-house at our Mumbai atelier. It adds zero delay to dispatch—all personalized orders leave our facility within 24 hours."
    },
    {
      question: "Will the Neodymium magnets in the Wall Key Holder scratch my keys?",
      answer: "Not at all. Our N52 Neodymium magnets are concealed behind a flush-finished layer of American walnut wood or bead-blasted aluminum, ensuring metal-on-metal scratching never occurs while maintaining strong magnetic grip."
    },
    {
      question: "Do you accept corporate bulk gifting or wedding favor requests?",
      answer: "Yes! We specialize in corporate gifting and bespoke packaging. We can laser engrave company logos, custom dates, or guest initials. Reach out via WhatsApp Concierge for volume tiers."
    },
    {
      question: "What is your warranty policy on hardware?",
      answer: "We offer a lifetime hardware guarantee on all solid brass and titanium components. If a carabiner spring or tension bolt ever fails under normal use, we replace it immediately."
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20 pb-20">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.25em] font-semibold text-gold-700">Concierge Desk</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-charcoal">We Are Here to Assist</h1>
        <p className="text-sm text-stone-warm">
          Whether inquiring about order status, custom monogramming, or leather care, our support specialists reply promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Info Column */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-cream-200/80 p-8 rounded-3xl border border-cream-300 space-y-6">
            <h3 className="font-serif text-2xl font-bold text-charcoal">Direct Contacts</h3>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-charcoal text-gold flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-charcoal">WhatsApp</h4>
                <p className="text-xs text-stone-warm mt-0.5">Instant assistance Mon-Sat, 9am - 8pm IST</p>
                <a
                  href="https://wa.me/919444232904"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gold-700 font-semibold mt-1 inline-block hover:underline"
                >
                  Start Chat (+91 94442 32904) &rarr;
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-charcoal text-gold flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-charcoal">EMail</h4>
                <p className="text-xs text-stone-warm mt-0.5">For press & corporate inquiries</p>
                <span className="text-xs text-charcoal font-medium mt-1 inline-block">concierge@giftme.in</span>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-charcoal text-gold flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-charcoal">Location</h4>
                <p className="text-xs text-stone-warm mt-0.5">14th Road, Bandra West, Mumbai 400050</p>
              </div>
            </div>
          </div>

          <div className="bg-charcoal text-cream-100 p-8 rounded-3xl shadow-luxury">
            <h4 className="font-serif font-bold text-lg text-gold mb-2">Backend Readiness Note</h4>
            <p className="text-xs text-stone-warm leading-relaxed">
              This contact form is wired cleanly with state handlers ready to connect directly to your upcoming **Spring Boot + Supabase** contact notification endpoint (`POST /api/v1/support/contact`).
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-7 bg-cream-100 p-8 sm:p-10 rounded-3xl border border-cream-300 shadow-luxury">
          {submitted ? (
            <div className="py-16 text-center space-y-4 animate-fade-in">
              <CheckCircle2 className="w-16 h-16 text-gold mx-auto" />
              <h3 className="font-serif text-2xl font-bold text-charcoal">Inquiry Received</h3>
              <p className="text-sm text-stone-warm max-w-md mx-auto">
                Thank you, {formData.name}. Gift Me has received your Message and will reply to <strong>{formData.email}</strong> within 2 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: '', message: '' });
                }}
                className="btn-primary text-xs px-6 py-3 mx-auto mt-4"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-charcoal mb-4">Send Us a Dispatch</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-2">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Aditya Chopra"
                    className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-2">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="aditya@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Custom Monogram Inquiry / Order #1042"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-2">Your Message *</label>
                <textarea
                  rows="4"
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="How can our leather craftsmen assist you today?"
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>

              <button type="submit" className="btn-primary w-full py-4 text-sm font-semibold shadow-luxury">
                <Send className="w-4 h-4" /> Send
              </button>
            </form>
          )}
        </div>
      </div>


    </div>
  );
}
