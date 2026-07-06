import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  Sparkles, 
  ArrowUpDown,
  LayoutGrid,
  List,
  Layers
} from 'lucide-react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../../lib/supabase';
import { getCategories } from '../../lib/categories';
import ProductFormModal from '../../components/admin/ProductFormModal';
import CategoryManagerModal from '../../components/admin/CategoryManagerModal';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  
  // Delete confirmation modal state
  const [deleteConfirmProd, setDeleteConfirmProd] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: '', message: '' }), 4000);
  };

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data || []);
    } catch (err) {
      console.error('Failed to load catalog:', err);
      showToast('Error loading product catalog', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const handleSaveProduct = async (productData) => {
    try {
      if (productToEdit) {
        await updateProduct(productToEdit.id, productData);
        showToast('Product successfully updated in database!');
      } else {
        await createProduct(productData);
        showToast('New product successfully published!');
      }
      loadCatalog();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmProd) return;
    setIsDeleting(true);
    try {
      await deleteProduct(deleteConfirmProd.id);
      showToast('Product permanently deleted.');
      setDeleteConfirmProd(null);
      loadCatalog();
    } catch (err) {
      showToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = ['All', ...getCategories(products)];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const cleanTerm = searchTerm.trim().toLowerCase();
    if (cleanTerm === '') return matchesCategory;

    const queryWords = cleanTerm.split(/\s+/).filter(Boolean);
    const matchesSearch = queryWords.some((word) => {
      const wordSingular = word.endsWith('s') ? word.slice(0, -1) : word;
      const checkStr = (str) => str && (str.toLowerCase().includes(word) || str.toLowerCase().includes(wordSingular));
      return (
        checkStr(p.product_name) ||
        checkStr(p.name) ||
        checkStr(p.description) ||
        checkStr(p.shortDescription) ||
        checkStr(p.category)
      );
    });

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 font-sans relative">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-up ${
          toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-cream-100' : 'bg-charcoal/95 border-gold text-cream-100'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            Inventory Catalog <span className="text-sm font-mono font-normal bg-cream-300 px-2.5 py-0.5 rounded-full text-stone-warm">({products.length})</span>
          </h1>
          <p className="text-xs text-stone-warm mt-1">
            Add, update pricing, or manage product images stored in Supabase.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-cream-200 hover:bg-cream-300 text-charcoal px-5 py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all border border-cream-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-gold-700" /> Manage Categories
          </button>
          <button
            onClick={() => {
              setProductToEdit(null);
              setIsModalOpen(true);
            }}
            className="bg-gold hover:bg-gold-400 text-charcoal-950 px-6 py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-luxury flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add New Product
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-stone-warm" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product title or keyword..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-cream-100 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-charcoal text-gold border-charcoal shadow-sm'
                    : 'bg-cream-100 text-charcoal border-cream-300 hover:border-gold'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 bg-cream-200 p-1.5 rounded-2xl border border-cream-300 self-start lg:self-center">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'grid' ? 'bg-charcoal text-gold shadow-sm scale-102' : 'text-stone-warm hover:text-charcoal hover:bg-cream-300/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" /> Large Cards View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              viewMode === 'table' ? 'bg-charcoal text-gold shadow-sm scale-102' : 'text-stone-warm hover:text-charcoal hover:bg-cream-300/50'
            }`}
          >
            <List className="w-4 h-4" /> Compact Table
          </button>
        </div>
      </div>

      {/* Products Catalog Table / Grid */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-cream-100 rounded-2xl border border-cream-300 animate-pulse"></div>
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-cream-100 rounded-3xl border border-cream-300 p-12 text-center space-y-3">
          <Package className="w-12 h-12 text-stone-warm mx-auto opacity-50" />
          <h3 className="font-serif font-bold text-base text-charcoal">No products matched query</h3>
          <p className="text-xs text-stone-warm max-w-md mx-auto">
            Try resetting your filters or click "Add New Product" to expand inventory.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {viewMode === 'grid' ? (
            /* Large Cards Grid View */
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => {
                    setProductToEdit(prod);
                    setIsModalOpen(true);
                  }}
                  className="bg-cream-100 rounded-3xl border border-cream-300 shadow-sm hover:border-gold hover:shadow-luxury transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer active:scale-[0.99]"
                >
                  {/* Top Image Showcase */}
                  <div className="relative aspect-square bg-cream-200 p-2 sm:p-3 border-b border-cream-300 overflow-hidden flex items-center justify-center">
                    <img
                      src={prod.image_url || '/assets/main view of product1.jpeg'}
                      alt={prod.product_name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                    />
                    {/* Stock Status Toggle Button */}
                    <div className="absolute top-3 right-3">
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const newStatus = !(prod.in_stock !== false && prod.stock_status !== 'Out of Stock');
                          const updated = { ...prod, in_stock: newStatus, stock_status: newStatus ? 'In Stock' : 'Out of Stock' };
                          await updateProduct(prod.id, updated);
                          setProducts(products.map(p => p.id === prod.id ? updated : p));
                          showToast(`Updated stock status to ${newStatus ? 'In Stock' : 'Out of Stock'}`, 'success');
                        }}
                        className={`pointer-events-auto px-3 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                          prod.in_stock === false || prod.stock_status === 'Out of Stock'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                        title="Click to toggle stock status"
                      >
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        {prod.in_stock === false || prod.stock_status === 'Out of Stock' ? 'Out of Stock' : 'In Stock'}
                      </button>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-3 sm:p-6 space-y-3 sm:space-y-4 flex-1 flex flex-col justify-between bg-gradient-to-b from-cream-100 to-cream-100/50">
                    <div>
                      <h3 className="font-serif text-sm sm:text-xl font-bold text-charcoal group-hover:text-gold-700 transition-colors leading-snug line-clamp-2">
                        {prod.product_name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-stone-warm line-clamp-2 mt-1 sm:mt-2 leading-relaxed font-light">
                        {prod.description}
                      </p>
                    </div>

                    {/* Pricing */}
                    <div className="pt-2 sm:pt-4 border-t border-cream-200 flex items-baseline justify-between">
                      <div>
                        <span className="text-[9px] sm:text-[10px] text-stone-warm uppercase tracking-wider block font-medium">Price</span>
                        <div className="flex items-baseline gap-1 sm:gap-2 mt-0.5">
                          <span className="font-serif text-base sm:text-2xl font-bold text-gold-700">
                            ₹{Number(prod.offer_price || 0).toLocaleString()}
                          </span>
                          {prod.original_price > prod.offer_price && (
                            <span className="text-[10px] sm:text-xs text-stone-warm line-through">
                              ₹{Number(prod.original_price || 0).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {prod.original_price > prod.offer_price && (
                        <span className="hidden sm:inline bg-gold/20 text-charcoal-900 font-bold text-[11px] px-2.5 py-1 rounded-lg">
                          Save ₹{(prod.original_price - prod.offer_price).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Actions Button Bar */}
                    <div className="pt-1 sm:pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProductToEdit(prod);
                          setIsModalOpen(true);
                        }}
                        className="flex-1 bg-charcoal hover:bg-gold text-cream-100 hover:text-charcoal-950 py-2 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-[10px] sm:text-xs transition-all flex items-center justify-center gap-1 sm:gap-2 shadow-sm cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Edit & Crop Image</span>
                        <span className="sm:hidden">Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmProd(prod);
                        }}
                        className="p-2 sm:p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View (for when user wants a compact list) */
            <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream-200/80 border-b border-cream-300 text-[11px] font-bold uppercase tracking-wider text-charcoal">
                      <th className="py-4 px-6">Product Item</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6">Original Price</th>
                      <th className="py-4 px-6">Offer Price</th>
                      <th className="py-4 px-6">Stock Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-300/60 text-xs">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-cream-200/40 transition-colors group">
                        <td
                          className="py-4 px-6 cursor-pointer"
                          onClick={() => {
                            setProductToEdit(prod);
                            setIsModalOpen(true);
                          }}
                          title="Click to edit product details"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-cream-200 p-1 border border-cream-300 overflow-hidden shrink-0 group-hover:border-gold transition-colors shadow-xs">
                              <img
                                src={prod.image_url || '/assets/main view of product1.jpeg'}
                                alt={prod.product_name}
                                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="max-w-md">
                              <p className="font-bold text-sm text-charcoal group-hover:text-gold-700 transition-colors flex items-center gap-2">
                                {prod.product_name}
                                <span className="text-[10px] text-gold-700 font-normal bg-gold/10 px-2.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  <Edit3 className="w-3 h-3" /> Edit
                                </span>
                              </p>
                              <p className="text-xs text-stone-warm line-clamp-2 mt-1">{prod.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="bg-cream-300/80 text-charcoal font-semibold px-3 py-1 rounded-full text-[11px]">
                            {prod.category}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-stone-warm line-through text-sm">
                          ₹{Number(prod.original_price || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6 font-bold text-gold-700 text-sm">
                          ₹{Number(prod.offer_price || 0).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={async () => {
                              const newStatus = !(prod.in_stock !== false && prod.stock_status !== 'Out of Stock');
                              const updated = { ...prod, in_stock: newStatus, stock_status: newStatus ? 'In Stock' : 'Out of Stock' };
                              await updateProduct(prod.id, updated);
                              setProducts(products.map(p => p.id === prod.id ? updated : p));
                              showToast(`Updated stock status to ${newStatus ? 'In Stock' : 'Out of Stock'}`, 'success');
                            }}
                            className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                              prod.in_stock === false || prod.stock_status === 'Out of Stock'
                                ? 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30'
                                : 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border border-emerald-500/30'
                            }`}
                            title="Click to toggle stock status"
                          >
                            <span className={`w-2 h-2 rounded-full ${prod.in_stock === false || prod.stock_status === 'Out of Stock' ? 'bg-red-600' : 'bg-emerald-600'}`}></span>
                            {prod.in_stock === false || prod.stock_status === 'Out of Stock' ? 'Out of Stock' : 'In Stock'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setProductToEdit(prod);
                                setIsModalOpen(true);
                              }}
                              className="p-2.5 rounded-xl bg-cream-200 hover:bg-gold hover:text-charcoal-950 text-charcoal transition-colors cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmProd(prod)}
                              className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />

      {/* Category Manager Modal */}
      <CategoryManagerModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onCategoryChange={loadCatalog}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmProd && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">Confirm Deletion</h3>
            <p className="text-xs text-stone-warm leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-charcoal">{deleteConfirmProd.product_name}</strong>? This action will remove it from the live catalog immediately.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                onClick={() => setDeleteConfirmProd(null)}
                className="py-3 rounded-xl bg-cream-200 text-charcoal font-semibold text-xs hover:bg-cream-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirmed}
                disabled={isDeleting}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
