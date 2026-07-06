import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout({ children }) {
  const { user, logoutAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Overview Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Product Inventory', path: '/admin/products', icon: Package },
    { name: 'Category Taxonomy', path: '/admin/categories', icon: Layers },
  ];

  return (
    <div className="min-h-screen bg-cream-200/50 flex flex-col lg:flex-row font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-charcoal text-cream-100 border-r border-gold/20 shadow-xl sticky top-0 h-screen justify-between p-6 z-30">
        <div>
          {/* Logo & Badge */}
          <div className="flex items-center justify-between pb-8 border-b border-cream-100/10">
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-gold">GiftMe</span>
              <span className="bg-gold/20 text-gold text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-gold/40 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> CMS
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-warm px-3 mb-3">
              Management Portal
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gold text-charcoal-950 shadow-md font-bold'
                      : 'text-cream-200/80 hover:bg-cream-100/10 hover:text-cream-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className="space-y-4 pt-6 border-t border-cream-100/10">
          <div className="bg-charcoal-900/60 p-3.5 rounded-xl border border-cream-100/10">
            <p className="text-[11px] text-stone-warm font-medium">Logged in as Admin</p>
            <p className="text-xs text-cream-100 font-mono truncate">{user?.email || 'admin@giftme.in'}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-cream-100/10 text-cream-200 text-xs font-medium hover:bg-cream-100/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/20 text-red-300 text-xs font-medium hover:bg-red-500/30 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="lg:hidden bg-charcoal text-cream-100 px-4 py-3.5 sticky top-0 z-40 shadow-md flex items-center justify-between border-b border-gold/20">
        <Link to="/admin/dashboard" className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold text-gold">GiftMe</span>
          <span className="bg-gold/20 text-gold text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-gold/40">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-cream-100 hover:text-gold focus:outline-none"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-charcoal/95 backdrop-blur-md pt-16 px-6 pb-6 flex flex-col justify-between">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 p-2 text-cream-100 hover:text-gold"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="space-y-6">
            <p className="text-xs uppercase font-bold tracking-widest text-gold">Admin Portal Navigation</p>
            <nav className="space-y-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-4 rounded-xl text-sm font-semibold ${
                      isActive ? 'bg-gold text-charcoal-950 font-bold' : 'text-cream-100 bg-cream-100/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="space-y-3 border-t border-cream-100/20 pt-6">
            <Link
              to="/"
              target="_blank"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cream-100/10 text-cream-100 text-xs font-semibold"
            >
              <ExternalLink className="w-4 h-4" /> View Customer Storefront
            </Link>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-500/20 text-red-300 text-xs font-semibold"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {children}
      </main>
    </div>
  );
}
