import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  Layers, 
  RefreshCw,
  Package,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { getCategories, addCategory, renameCategory, deleteCategory } from '../../lib/categories';
import { fetchProducts } from '../../lib/supabase';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New category state
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Edit state
  const [editingCat, setEditingCat] = useState(null);
  const [editInput, setEditInput] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Delete confirmation state
  const [deletingCat, setDeletingCat] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, type: '', text: '' });

  const showToast = (text, type = 'success') => {
    setToast({ show: true, type, text });
    setTimeout(() => setToast({ show: false, type: '', text: '' }), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const prodList = await fetchProducts();
      setProducts(prodList || []);
      const catList = getCategories(prodList || []);
      setCategories(catList);
    } catch (err) {
      console.error('Error loading category management data:', err);
      showToast('Failed to load category data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getProductCount = (catName) => {
    return products.filter(p => p.category === catName).length;
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsAdding(true);
    try {
      addCategory(newCatName.trim());
      showToast(`Added new category: "${newCatName.trim()}"`);
      setNewCatName('');
      await loadData();
    } catch (err) {
      showToast('Failed to add category', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (cat) => {
    setEditingCat(cat);
    setEditInput(cat);
  };

  const handleSaveEdit = async () => {
    if (!editInput.trim() || editInput.trim() === editingCat) {
      setEditingCat(null);
      return;
    }
    setIsSavingEdit(true);
    try {
      const oldName = editingCat;
      const newName = editInput.trim();
      const count = await renameCategory(oldName, newName);
      showToast(`Renamed "${oldName}" to "${newName}". Updated ${count} product${count !== 1 ? 's' : ''}!`);
      setEditingCat(null);
      await loadData();
    } catch (err) {
      showToast('Failed to rename category', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCat) return;
    setIsDeleting(true);
    try {
      const count = await deleteCategory(deletingCat, 'General');
      showToast(`Deleted "${deletingCat}". Reassigned ${count} product${count !== 1 ? 's' : ''} to General.`);
      setDeletingCat(null);
      await loadData();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalCategorizedProducts = products.filter(p => p.category && p.category !== 'General').length;

  return (
    <div className="space-y-8 font-sans relative">
      
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-slide-up ${
          toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-cream-100' : 'bg-charcoal/95 border-gold text-cream-100'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-gold shrink-0" />}
          <span className="text-xs font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-cream-100 p-6 sm:p-8 rounded-3xl border border-cream-300 shadow-sm">
        <div>
          <span className="bg-gold/20 text-gold-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-gold/40 flex items-center gap-1.5 w-fit mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Taxonomy & Catalog Structure
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal flex items-center gap-2">
            Category Management <span className="text-sm font-mono font-normal bg-cream-300 px-2.5 py-0.5 rounded-full text-stone-warm">({categories.length})</span>
          </h1>
          <p className="text-xs text-stone-warm mt-1">
            Create, rename, or delete product categories. Changes automatically sync across Supabase and the Storefront.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-cream-100 p-6 rounded-3xl border border-cream-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">Active Categories</span>
            <div className="p-3 bg-gold/15 text-gold-700 rounded-2xl">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-charcoal">{categories.length}</span>
            <p className="text-[11px] text-stone-warm mt-1">Available collection filters</p>
          </div>
        </div>

        <div className="bg-cream-100 p-6 rounded-3xl border border-cream-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">Categorized Items</span>
            <div className="p-3 bg-emerald-500/15 text-emerald-600 rounded-2xl">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-3xl font-bold text-charcoal">{totalCategorizedProducts}</span>
            <p className="text-[11px] text-stone-warm mt-1">Products in specific collections</p>
          </div>
        </div>

        <div className="bg-cream-100 p-6 rounded-3xl border border-cream-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">Default Fallback</span>
            <div className="p-3 bg-charcoal/10 text-charcoal rounded-2xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="font-serif text-xl font-bold text-charcoal">"General" Protected</span>
            <p className="text-[11px] text-stone-warm mt-1">Safe haven for deleted categories</p>
          </div>
        </div>
      </div>

      {/* Main Section: Add Category + List */}
      <div className="bg-cream-100 rounded-3xl border border-cream-300 shadow-sm p-6 sm:p-8 space-y-8">
        
        {/* Add Category Bar */}
        <form onSubmit={handleAddCategory} className="bg-cream-200/80 p-5 rounded-2xl border border-cream-300 shadow-xs space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-gold-700" /> Add New Category Option
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Executive Desk Accessories, Personalized Pens, Premium Metal Keyrings..."
              className="flex-1 px-4 py-3.5 rounded-xl bg-cream-100 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold shadow-sm"
            />
            <button
              type="submit"
              disabled={!newCatName.trim() || isAdding}
              className="bg-gold hover:bg-gold-400 disabled:opacity-50 text-charcoal-950 px-6 py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        </form>

        {/* Category List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-cream-300 pb-3">
            <div>
              <h3 className="font-serif font-bold text-lg text-charcoal">Existing Collection Taxonomy</h3>
              <p className="text-xs text-stone-warm">Click the edit or delete icons to manage categories. Renaming or deleting updates products automatically.</p>
            </div>
            <button
              onClick={loadData}
              className="text-xs font-semibold text-stone-warm hover:text-charcoal flex items-center gap-1 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-cream-200 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 bg-cream-200/50 rounded-2xl border border-cream-300">
              <Tag className="w-10 h-10 text-stone-warm mx-auto mb-2 opacity-50" />
              <p className="text-xs font-medium text-stone-warm">No categories found in inventory.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat, idx) => {
                const prodCount = getProductCount(cat);
                const isEditing = editingCat === cat;
                const isGeneral = cat === 'General';

                return (
                  <div
                    key={idx}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                      isEditing 
                        ? 'bg-cream-200 border-gold shadow-md md:col-span-2' 
                        : 'bg-cream-200/40 border-cream-300 hover:bg-cream-200 hover:border-gold/60 shadow-xs'
                    }`}
                  >
                    {isEditing ? (
                      /* Inline Edit Mode */
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                        <div className="flex-1 relative">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-warm mb-1">
                            Rename Category
                          </label>
                          <input
                            type="text"
                            value={editInput}
                            onChange={(e) => setEditInput(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl bg-white border-2 border-gold text-xs font-bold text-charcoal focus:outline-none"
                            autoFocus
                          />
                          {prodCount > 0 && (
                            <span className="block text-[11px] text-gold-700 font-medium mt-1.5 flex items-center gap-1.5">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                              <span>Will automatically update <strong>{prodCount} product{prodCount !== 1 ? 's' : ''}</strong> in database!</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-end gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={isSavingEdit}
                            className="flex-1 sm:flex-none justify-center px-5 py-3 bg-charcoal text-gold hover:bg-gold hover:text-charcoal-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Check className="w-4 h-4" /> {isSavingEdit ? 'Saving...' : 'Save Changes'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCat(null)}
                            className="flex-1 sm:flex-none justify-center px-4 py-3 bg-cream-300 hover:bg-cream-400 text-charcoal font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Standard View Mode */
                      <>
                        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cream-100 border border-cream-300 flex items-center justify-center text-charcoal shrink-0 shadow-2xs">
                            <Tag className="w-5 h-5 text-gold-700" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-base text-charcoal truncate">
                                {cat}
                              </p>
                              {isGeneral && (
                                <span className="text-[10px] uppercase tracking-wider font-bold bg-charcoal/10 text-charcoal px-2.5 py-0.5 rounded-full shrink-0">
                                  Default Fallback
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-warm flex items-center gap-1.5 mt-1">
                              <Package className="w-3.5 h-3.5 text-stone-warm shrink-0" />
                              <span className="font-semibold text-charcoal">{prodCount}</span> product{prodCount !== 1 ? 's' : ''} assigned
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-0 border-cream-300/60 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="flex-1 sm:flex-none justify-center py-2.5 px-4 sm:p-3 rounded-xl bg-cream-100 hover:bg-gold hover:text-charcoal-950 text-charcoal border border-cream-300 transition-all shadow-2xs cursor-pointer flex items-center gap-2 text-xs font-semibold sm:font-normal"
                            title="Rename Category"
                          >
                            <Edit3 className="w-4 h-4" /> <span className="sm:hidden">Rename Category</span>
                          </button>

                          {!isGeneral ? (
                            <button
                              type="button"
                              onClick={() => setDeletingCat(cat)}
                              className="flex-1 sm:flex-none justify-center py-2.5 px-4 sm:p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold sm:font-normal"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" /> <span className="sm:hidden">Delete</span>
                            </button>
                          ) : (
                            <span className="w-full sm:w-auto text-center px-3 py-2 text-[11px] text-stone-warm font-semibold italic bg-cream-100 rounded-xl border border-cream-300">
                              Protected Fallback
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal Overlay */}
      {deletingCat && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-lg text-charcoal">Confirm Category Deletion</h3>
            <p className="text-xs text-stone-warm leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-charcoal">"{deletingCat}"</strong>?
            </p>
            {getProductCount(deletingCat) > 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 text-xs text-left font-medium flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>{getProductCount(deletingCat)} product(s)</strong> currently use this category. Deleting it will automatically reassign these products to <strong>"General"</strong>.
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={() => setDeletingCat(null)}
                className="py-3 rounded-xl bg-cream-200 text-charcoal font-semibold text-xs hover:bg-cream-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
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
