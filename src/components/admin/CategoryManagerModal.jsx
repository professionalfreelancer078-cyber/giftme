import React, { useState, useEffect } from 'react';
import { 
  X, 
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
  ArrowRight
} from 'lucide-react';
import { getCategories, addCategory, renameCategory, deleteCategory } from '../../lib/categories';
import { fetchProducts } from '../../lib/supabase';

export default function CategoryManagerModal({ isOpen, onClose, onCategoryChange }) {
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
      console.error('Error loading category manager data:', err);
      showToast('Failed to load category data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      setEditingCat(null);
      setDeletingCat(null);
      setNewCatName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
      if (onCategoryChange) onCategoryChange();
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
      if (onCategoryChange) onCategoryChange();
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
      if (onCategoryChange) onCategoryChange();
    } catch (err) {
      showToast('Failed to delete category', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-cream-100 rounded-2xl sm:rounded-3xl border-2 border-gold/40 shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in my-4 sm:my-8 relative">
        
        {/* Toast Notification */}
        {toast.show && (
          <div className={`absolute top-16 right-4 sm:right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2 animate-slide-up text-xs font-bold ${
            toast.type === 'error' ? 'bg-red-900/95 border-red-500 text-cream-100' : 'bg-charcoal/95 border-gold text-cream-100'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-400 shrink-0" /> : <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />}
            <span>{toast.text}</span>
          </div>
        )}

        {/* Header */}
        <div className="bg-charcoal text-cream-100 px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gold/15 text-gold rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-cream-100 flex items-center gap-2">
                Taxonomy & Category Manager
                <span className="bg-gold/20 text-gold text-[10px] font-bold px-2 py-0.5 rounded-full font-mono font-normal">
                  {categories.length} Active
                </span>
              </h3>
              <p className="text-[11px] text-stone-warm">Create, edit, or remove catalog categories cleanly</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-cream-200 hover:text-gold transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto font-sans">
          
          {/* Add New Category Form */}
          <form onSubmit={handleAddCategory} className="bg-cream-200/70 p-4 rounded-2xl border border-cream-300 shadow-xs space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-700" /> Add New Product Category
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Executive Desk Accessories, Personalized Pens..."
                className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-cream-100 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold shadow-xs"
              />
              <button
                type="submit"
                disabled={!newCatName.trim() || isAdding}
                className="w-full sm:w-auto justify-center bg-gold hover:bg-gold-400 disabled:opacity-50 text-charcoal-950 px-5 py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-sm flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Option
              </button>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-warm">Existing Categories</span>
              <span className="text-[11px] text-stone-warm font-medium">Auto-syncs across Supabase & Storefront</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-cream-200 rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8 bg-cream-200/40 rounded-2xl border border-cream-300">
                <Tag className="w-8 h-8 text-stone-warm mx-auto mb-2 opacity-50" />
                <p className="text-xs text-stone-warm font-medium">No categories found.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {categories.map((cat, idx) => {
                  const prodCount = getProductCount(cat);
                  const isEditing = editingCat === cat;
                  const isGeneral = cat === 'General';

                  return (
                    <div
                      key={idx}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border transition-all ${
                        isEditing 
                          ? 'bg-cream-200 border-gold shadow-md' 
                          : 'bg-cream-100 border-cream-300 hover:border-gold/60 shadow-2xs'
                      }`}
                    >
                      {isEditing ? (
                        /* Inline Edit Mode */
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full">
                          <div className="flex-1 relative">
                            <input
                              type="text"
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                              className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-gold text-xs font-bold text-charcoal focus:outline-none"
                              autoFocus
                            />
                            {prodCount > 0 && (
                              <span className="block text-[10px] text-gold-700 font-medium mt-1 flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin shrink-0" /> 
                                <span>Will automatically update {prodCount} product{prodCount !== 1 ? 's' : ''}</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={isSavingEdit}
                              className="flex-1 sm:flex-none justify-center px-4 py-2.5 bg-charcoal text-gold hover:bg-gold hover:text-charcoal-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" /> {isSavingEdit ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCat(null)}
                              className="flex-1 sm:flex-none justify-center px-3 py-2.5 bg-cream-300 hover:bg-cream-400 text-charcoal font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard View Mode */
                        <>
                          <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-cream-200 border border-cream-300 flex items-center justify-center text-charcoal shrink-0">
                              <Tag className="w-4 h-4 text-gold-700" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-bold text-sm text-charcoal truncate">
                                  {cat}
                                </p>
                                {isGeneral && (
                                  <span className="text-[9px] uppercase tracking-wider font-bold bg-charcoal/10 text-charcoal px-2 py-0.5 rounded-md shrink-0">
                                    Default Fallback
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-warm flex items-center gap-1 mt-0.5">
                                <Package className="w-3 h-3 shrink-0" />
                                <span>{prodCount} product{prodCount !== 1 ? 's' : ''} assigned</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-0 border-cream-200/80 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(cat)}
                              className="flex-1 sm:flex-none justify-center py-2 px-3 sm:p-2.5 rounded-xl bg-cream-200 hover:bg-gold hover:text-charcoal-950 text-charcoal transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold sm:font-normal"
                              title="Rename Category"
                            >
                              <Edit3 className="w-3.5 h-3.5" /> <span className="sm:hidden">Rename</span>
                            </button>

                            {!isGeneral ? (
                              <button
                                type="button"
                                onClick={() => setDeletingCat(cat)}
                                className="flex-1 sm:flex-none justify-center py-2 px-3 sm:p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold sm:font-normal"
                                title="Delete Category"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> <span className="sm:hidden">Delete</span>
                              </button>
                            ) : (
                              <span className="w-full sm:w-auto text-center px-3 py-1.5 text-[10px] text-stone-warm font-semibold italic bg-cream-200/50 rounded-lg">
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

        {/* Footer */}
        <div className="bg-cream-200 px-4 sm:px-6 py-4 border-t border-cream-300 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-stone-warm font-medium text-center sm:text-left">
            Tip: Deleting a category safely moves its products to "General".
          </span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-charcoal text-cream-100 hover:bg-gold hover:text-charcoal-950 font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer text-center"
          >
            Done
          </button>
        </div>

        {/* Delete Confirmation Overlay */}
        {deletingCat && (
          <div className="absolute inset-0 z-50 bg-charcoal/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
            <div className="bg-cream-100 rounded-3xl border border-cream-300 p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
              <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal">Delete Category?</h3>
              <p className="text-xs text-stone-warm leading-relaxed">
                Are you sure you want to permanently remove <strong className="text-charcoal">"{deletingCat}"</strong> from the catalog?
              </p>
              {getProductCount(deletingCat) > 0 && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 text-xs text-left font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    <strong>{getProductCount(deletingCat)} product(s)</strong> currently use this category. They will be automatically reassigned to <strong>"General"</strong>.
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
    </div>
  );
}
