import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { fetchProducts } from '../lib/supabase';
import { products as localProducts } from '../data/products';
import { getCategories } from '../lib/categories';
import ProductCard from '../components/ProductCard';
import UploadedShowcase from '../components/UploadedShowcase';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('latest');
  const [catalog, setCatalog] = useState(localProducts);
  const [loading, setLoading] = useState(true);

  const categories = ['All', ...getCategories(catalog)];

  useEffect(() => {
    let mounted = true;
    async function loadShopProducts() {
      setLoading(true);
      try {
        const data = await fetchProducts();
        if (mounted && data) {
          const mapped = (data || []).map((p) => ({
            ...p,
            id: p.id,
            name: p.product_name || p.name,
            price: Number(p.offer_price || p.price || 0),
            originalPrice: Number(p.original_price || p.originalPrice || 0),
            shortDescription: p.description || p.shortDescription || '',
            images: p.images || [p.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
            category: p.category || 'General',
            created_at: p.created_at || new Date(0).toISOString()
          }));
          setCatalog(mapped);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadShopProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) {
      setSelectedCategory(cat);
    } else {
      setSelectedCategory('All');
    }
    const s = searchParams.get('search');
    if (s !== null) {
      setSearchQuery(s);
    } else {
      setSearchQuery('');
    }
  }, [searchParams]);

  // Filter products
  const filteredProducts = catalog.filter((product) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (cleanQuery === '') return matchesCategory;

    const queryWords = cleanQuery.split(/\s+/).filter(Boolean);

    const matchesSearch = queryWords.some((word) => {
      const wordSingular = word.endsWith('s') ? word.slice(0, -1) : word;
      const checkStr = (str) => str && (str.toLowerCase().includes(word) || str.toLowerCase().includes(wordSingular));

      return (
        checkStr(product.name || product.product_name) ||
        checkStr(product.shortDescription) ||
        checkStr(product.description) ||
        checkStr(product.category) ||
        (Array.isArray(product.colors) && product.colors.some(c => checkStr(c))) ||
        (Array.isArray(product.features) && product.features.some(f => checkStr(f)))
      );
    });

    return matchesCategory && matchesSearch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
    if (sortBy === 'latest') {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    }
    return 0;
  });

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setSortBy('latest');
    setSearchParams({});
  };

  // Pick only 4-5 of the most recently uploaded products by the admin for the top showcase
  const recentShowcaseProducts = [...catalog]
    .filter(p => p.in_stock !== false && p.stock_status !== 'Out of Stock' && p.in_stock !== 'false')
    .sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    })
    .slice(0, 5);

  return (
    <div className="space-y-10 pb-16">
      <Helmet>
        <title>Shop Collection | GiftMe — Luxury Key Holders & Custom Keychains</title>
        <meta name="description" content="Explore our complete collection of personalized key holders, custom engraved keychains, and modern lifestyle products at GiftMe." />
        <link rel="canonical" href="https://giftmeofficial.netlify.app/shop" />
        <meta property="og:title" content="Shop Collection | GiftMe — Luxury Key Holders & Custom Keychains" />
        <meta property="og:url" content="https://giftmeofficial.netlify.app/shop" />
      </Helmet>
      
      {/* Signature Products Slide View (showcased at top of Shop Collection - limited to 5 newest products) */}
      <UploadedShowcase products={recentShowcaseProducts} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls Bar: Category Tabs & Sort Dropdown (Search is in Navbar) */}
        <div className="bg-cream-200/80 p-4 sm:p-6 rounded-2xl border border-cream-300 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-none">
            <Filter className="w-4 h-4 text-stone-warm mr-1 flex-shrink-0 hidden sm:block" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-charcoal text-cream-100 shadow-sm font-bold'
                    : 'bg-cream-100 text-charcoal hover:bg-gold/30 border border-cream-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-cream-300">
            <span className="text-xs text-stone-warm flex items-center gap-1.5 font-medium whitespace-nowrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gold-700" /> Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-cream-100 border border-cream-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-charcoal focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="latest">Latest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

      {/* Active Filter Tags */}
      {(selectedCategory !== 'All' || searchQuery !== '') && (
        <div className="flex items-center gap-3 text-xs">
          <span className="text-stone-warm">Active filters:</span>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-charcoal font-semibold">
              Category: {selectedCategory}
              <button onClick={() => handleCategorySelect('All')} className="hover:text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {searchQuery !== '' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/20 text-charcoal font-semibold">
              Query: "{searchQuery}"
              <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button onClick={clearFilters} className="text-gold-700 underline hover:text-charcoal font-medium ml-2">
            Reset All
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs text-stone-warm">
            Showing <strong className="text-charcoal font-semibold">{sortedProducts.length}</strong> architectural pieces
          </span>
        </div>

        {loading && sortedProducts.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-cream-200/60 rounded-2xl h-[320px] border border-cream-300 p-4 space-y-3 flex flex-col justify-between">
                <div className="w-full h-48 bg-cream-300/80 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-cream-300/80 rounded w-3/4"></div>
                  <div className="h-3 bg-cream-300/80 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="bg-cream-200/50 rounded-2xl p-16 text-center space-y-4 border border-cream-300">
            <h3 className="font-serif text-2xl font-bold text-charcoal">No Products Found</h3>
            <p className="text-sm text-stone-warm max-w-md mx-auto">
              There are no products matching "{searchQuery}" in our collection. Try searching with different keywords or reset your filters to explore all items.
            </p>
            <button onClick={clearFilters} className="btn-gold px-6 py-2.5 text-xs mx-auto">
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 animate-fade-in">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}
