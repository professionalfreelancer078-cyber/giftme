import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, Key, Sparkles, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function Navbar() {
  const { cartCount, setIsCartDrawerOpen } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowSearchModal(false);
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    } else {
      navigate('/shop');
    }
  };

  const navLinks = [
    { name: 'Shop Collection', path: '/' },
    { name: 'Brand Story / Home', path: '/home' },
    { name: 'Contact Us', path: '/contact' },
  ];

  return (
    <>


      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-cream-100/90 backdrop-blur-md shadow-luxury py-3 border-b border-cream-300'
          : 'bg-cream-100 py-5 border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/assets/logo.png"
              alt="Logo"
              className="w-16 h-16 rounded-full object-contain bg-white border-2 border-black p-1"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide transition-colors duration-200 py-1 relative ${isActive
                    ? 'text-charcoal font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-gold'
                    : 'text-stone-warm hover:text-charcoal'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Search Button */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-2.5 rounded-xl bg-cream-200/80 text-charcoal hover:bg-gold/20 hover:text-charcoal transition-all"
              aria-label="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="p-2.5 rounded-xl bg-cream-200/80 text-charcoal hover:bg-gold/20 hover:text-charcoal transition-all relative flex items-center justify-center"
              aria-label="Saved Wishlist"
              title="View Wishlist"
            >
              <Heart className={`w-5 h-5 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center absolute -top-1 -right-1 border border-cream-100 shadow-xs animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Trigger Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="p-2.5 rounded-xl bg-charcoal text-cream-100 hover:bg-gold hover:text-charcoal-950 transition-all relative shadow-luxury flex items-center gap-2"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="bg-gold text-charcoal-950 font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center absolute -top-1.5 -right-1.5 border-2 border-cream-100 shadow-sm animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-cream-200 text-charcoal"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-cream-100 border-b border-cream-300 px-6 py-6 shadow-luxury animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-lg font-medium py-2 border-b border-cream-200 ${isActive ? 'text-gold-700 font-semibold pl-2 border-l-2 border-gold' : 'text-charcoal'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-xl bg-cream-200 text-charcoal hover:bg-gold/30 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-red-500 text-red-500' : ''}`} />
                  View Wishlist ({wishlistCount})
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsCartDrawerOpen(true);
                  }}
                  className="btn-primary w-full"
                >
                  <ShoppingBag className="w-5 h-5" />
                  View Bag ({cartCount})
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4 animate-fade-in">
          <div className="bg-cream-100 rounded-2xl max-w-xl w-full p-6 shadow-luxury border border-cream-300 relative">
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 right-4 p-2 text-stone-warm hover:text-charcoal"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-xl font-semibold mb-4 text-charcoal">Search GiftMe Catalog</h3>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-stone-warm absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search gifts, keychains, accessories..."
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-cream-200 border border-cream-300 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold text-charcoal"
                  autoFocus
                />
              </div>
              <button type="submit" className="btn-gold px-6">
                Search
              </button>
            </form>
            <div className="mt-4">
              <span className="text-xs text-stone-warm uppercase tracking-wider font-semibold">Popular searches:</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {['Gifts', 'Personalized', 'Accessories', 'Keychains'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setShowSearchModal(false);
                      navigate(`/shop?search=${encodeURIComponent(term)}`);
                    }}
                    className="text-xs bg-cream-200 hover:bg-gold/30 px-3 py-1.5 rounded-lg text-charcoal transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
