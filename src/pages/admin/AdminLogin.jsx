import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2">
          <span className="font-serif text-3xl font-bold tracking-tight text-charcoal">GiftMe</span>
          <span className="bg-charcoal text-gold text-xs font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1 uppercase tracking-widest">
            <Shield className="w-3 h-3 text-gold" /> CMS
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-serif font-bold text-charcoal">
          Admin Portal Authentication
        </h2>
        <p className="mt-2 text-center text-xs text-stone-warm">
          Restricted access. Customers must use the public storefront.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-cream-100 py-8 px-6 shadow-luxury rounded-3xl border-2 border-gold/30 sm:px-10 relative overflow-hidden">
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-warm">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-sm text-charcoal focus:outline-none focus:border-gold transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-warm">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-sm text-charcoal focus:outline-none focus:border-gold transition-all"
                />
              </div>
              <p className="mt-1 text-[11px] text-stone-warm italic">
                Enter your registered admin credentials to log in.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gold hover:bg-gold-400 text-charcoal-950 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-luxury flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                <>
                  <span>Access Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-cream-300 text-center">
            <Link
              to="/"
              className="text-xs font-semibold text-stone-warm hover:text-charcoal transition-colors inline-flex items-center gap-1"
            >
              &larr; Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
