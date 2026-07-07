import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Camera, 
  Image as ImageIcon, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  DollarSign,
  Plus,
  Edit3,
  Check,
  Crop as CropIcon
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { getCategories, saveCategories, addCategory, renameCategory, deleteCategory } from '../../lib/categories';
import ImageCropperModal from './ImageCropperModal';

export default function ProductFormModal({ isOpen, onClose, onSave, productToEdit = null }) {
  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    category: 'General',
    original_price: '',
    offer_price: '',
    image_url: '',
    images: [],
    in_stock: true
  });

  const [imageFiles, setImageFiles] = useState([null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState(['', '', '', '']);
  const [activeSlot, setActiveSlot] = useState(0);
  const [cropperState, setCropperState] = useState({
    isOpen: false,
    imageSrc: '',
    slotIndex: 0
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [categoryList, setCategoryList] = useState(() => getCategories());
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCategoryOption, setNewCategoryOption] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  useEffect(() => {
    const cats = getCategories();
    setCategoryList(cats);
    setIsCustomCategory(false);
    setIsManagingCategories(false);

    if (productToEdit) {
      setFormData({
        product_name: productToEdit.product_name || '',
        description: productToEdit.description || '',
        category: productToEdit.category || (cats[0] || 'General'),
        original_price: productToEdit.original_price || '',
        offer_price: productToEdit.offer_price || '',
        image_url: productToEdit.image_url || '',
        images: productToEdit.images || (productToEdit.image_url ? [productToEdit.image_url] : []),
        in_stock: productToEdit.in_stock !== false && productToEdit.stock_status !== 'Out of Stock'
      });
      const initialPreviews = ['', '', '', ''];
      const existingImages = productToEdit.images || (productToEdit.image_url ? [productToEdit.image_url] : []);
      existingImages.forEach((url, i) => { if (i < 4) initialPreviews[i] = url; });
      setImagePreviews(initialPreviews);
    } else {
      setFormData({
        product_name: '',
        description: '',
        category: cats[0] || 'General',
        original_price: '',
        offer_price: '',
        image_url: '',
        images: [],
        in_stock: true
      });
      setImagePreviews(['', '', '', '']);
    }
    setImageFiles([null, null, null, null]);
    setCropperState({ isOpen: false, imageSrc: '', slotIndex: 0 });
    setUploadProgress(0);
    setStatusMsg({ type: '', text: '' });
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  // HTML5 Canvas Image Compression Utility
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxDim = 1600; // Resize large smartphone camera photos

          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Export compressed WEBP or JPEG
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Canvas compression failed'));
                return;
              }
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve({ file: compressedFile, dataUrl: canvas.toDataURL('image/webp', 0.82) });
            },
            'image/webp',
            0.82
          );
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setStatusMsg({ type: 'error', text: 'Image file exceeds the 5MB maximum limit.' });
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setStatusMsg({ type: 'error', text: 'Invalid format. Allowed: JPG, JPEG, PNG, WEBP.' });
      return;
    }

    setStatusMsg({ type: 'info', text: 'Compressing image for optimal performance...' });

    const updateSlot = (compressedFile, previewUrl) => {
      setImageFiles(prev => {
        const newFiles = [...prev];
        newFiles[activeSlot] = compressedFile;
        return newFiles;
      });
      setImagePreviews(prev => {
        const newPreviews = [...prev];
        newPreviews[activeSlot] = previewUrl;
        return newPreviews;
      });
    };

    try {
      const { file: compressed, dataUrl } = await compressImage(file);
      updateSlot(compressed, dataUrl);
      setCropperState({
        isOpen: true,
        imageSrc: dataUrl,
        slotIndex: activeSlot
      });
      setStatusMsg({ type: 'info', text: 'Image loaded! Adjust crop to ensure perfect storefront display.' });
    } catch (err) {
      console.error(err);
      const url = URL.createObjectURL(file);
      updateSlot(file, url);
      setCropperState({
        isOpen: true,
        imageSrc: url,
        slotIndex: activeSlot
      });
      setStatusMsg({ type: 'info', text: 'Image loaded! Adjust crop to ensure perfect storefront display.' });
    }
  };

  const handleCropComplete = (croppedFile, croppedDataUrl) => {
    const slot = cropperState.slotIndex;
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles[slot] = croppedFile;
      return newFiles;
    });
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[slot] = croppedDataUrl;
      return newPreviews;
    });
    setStatusMsg({ type: 'success', text: `Image cropped (${Math.round(croppedFile.size / 1024)} KB) and ready for upload.` });
  };

  const handleUploadToStorage = async () => {
    if (!imageFiles.some(f => f !== null) && !imagePreviews.some(p => p !== '')) {
      setStatusMsg({ type: 'error', text: 'Please select at least one image.' });
      return null;
    }

    setIsUploading(true);
    setUploadProgress(10);
    const uploadedUrls = [];

    try {
      for (let i = 0; i < 4; i++) {
        if (imageFiles[i] && isSupabaseConfigured) {
          const fileExt = imageFiles[i].name.split('.').pop() || 'webp';
          const fileName = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
          const filePath = `catalog/${fileName}`;

          setUploadProgress(10 + (i * 20));
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(filePath, imageFiles[i], {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(filePath);

          uploadedUrls[i] = publicUrl;
        } else {
          uploadedUrls[i] = imagePreviews[i] || '';
        }
      }

      setUploadProgress(100);
      const finalUrls = uploadedUrls.filter(url => url !== '');
      setStatusMsg({ type: 'success', text: 'Images successfully processed!' });
      
      setFormData(prev => ({ 
        ...prev, 
        images: finalUrls,
        image_url: finalUrls[0] || '' 
      }));
      return finalUrls;
    } catch (err) {
      console.error(err);
      setStatusMsg({ type: 'error', text: 'Upload failed: ' + err.message });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = (index) => {
    setImageFiles(prev => {
      const newFiles = [...prev];
      newFiles[index] = null;
      return newFiles;
    });
    setImagePreviews(prev => {
      const newPreviews = [...prev];
      newPreviews[index] = '';
      return newPreviews;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const uploadedUrls = await handleUploadToStorage();
      if (!uploadedUrls || uploadedUrls.length === 0) {
        setIsSubmitting(false);
        return;
      }
      
      const currentCat = formData.category;
      if (currentCat && currentCat.trim()) {
        const updatedCats = Array.from(new Set([...categoryList, currentCat.trim()]));
        saveCategories(updatedCats);
      }

      await onSave({
        ...formData,
        category: currentCat ? currentCat.trim() : 'General',
        images: uploadedUrls,
        image_url: uploadedUrls[0] || '',
        price: formData.offer_price,
        in_stock: formData.in_stock !== false,
        stock_status: formData.in_stock !== false ? 'In Stock' : 'Out of Stock'
      });
      onClose();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Failed to save product.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-cream-100 rounded-3xl border-2 border-gold/40 shadow-2xl max-w-2xl w-full overflow-hidden animate-fade-in my-8">
        {/* Modal Header */}
        <div className="bg-charcoal text-cream-100 px-6 py-5 flex items-center justify-between border-b border-gold/30">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-gold" />
            <h3 className="font-serif font-bold text-lg text-cream-100">
              {productToEdit ? 'Edit Product Specification' : 'Add New Inventory Item'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-cream-200 hover:text-gold transition-colors rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Status Message Banner */}
          {statusMsg.text && (
            <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
              statusMsg.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-600' :
              statusMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700' :
              'bg-blue-500/10 border-blue-500/30 text-blue-700'
            }`}>
              {statusMsg.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* Device Image Uploader Section */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal flex items-center justify-between">
              <span>Product Photography (Max 5MB each)</span>
              <span className="text-gold-700 font-medium normal-case">Up to 4 images</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {['Main View', 'Side View', 'Back View', 'Detail'].map((label, idx) => (
                <div key={idx} className="flex flex-col gap-2 group">
                  <div 
                    onClick={() => {
                      if (!imagePreviews[idx]) {
                        setActiveSlot(idx);
                        fileInputRef.current?.click();
                      }
                    }}
                    className={`aspect-square rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all ${
                      imagePreviews[idx] 
                        ? 'border-gold bg-cream-200 shadow-sm' 
                        : 'border-dashed border-cream-400 bg-cream-200/50 hover:border-gold cursor-pointer hover:bg-cream-200 hover:-translate-y-1'
                    }`}
                  >
                    {imagePreviews[idx] ? (
                      <div className="relative w-full h-full">
                        <img src={imagePreviews[idx]} alt={label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setCropperState({ isOpen: true, imageSrc: imagePreviews[idx], slotIndex: idx }); }}
                            className="w-8 h-8 flex items-center justify-center bg-gold text-charcoal-950 hover:bg-gold-400 transition-colors rounded-full shadow-sm"
                            title="Crop & Align Image"
                          >
                            <CropIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setActiveSlot(idx); fileInputRef.current?.click(); }}
                            className="w-8 h-8 flex items-center justify-center bg-cream-100 rounded-full text-charcoal hover:text-gold hover:bg-charcoal-900 transition-colors shadow-sm"
                            title="Replace"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteImage(idx); }}
                            className="w-8 h-8 flex items-center justify-center bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-sm"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 bg-charcoal text-gold text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Main
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-warm">
                        <Plus className="w-6 h-6 mb-1 opacity-50 text-gold-600" />
                        <span className="text-[10px] font-semibold text-charcoal">{label}</span>
                      </div>
                    )}
                  </div>
                  {/* Quick Mobile Camera Access for Empty Slots */}
                  {!imagePreviews[idx] && (
                    <button
                      type="button"
                      onClick={() => { setActiveSlot(idx); cameraInputRef.current?.click(); }}
                      className="text-[10px] text-charcoal font-semibold bg-cream-100 py-1.5 rounded-lg border border-cream-300 hover:border-gold hover:text-gold-700 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Camera className="w-3 h-3" /> Take Photo
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] font-bold text-charcoal">
                  <span>Uploading to Supabase Storage...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-cream-300 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={formData.product_name}
                onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="e.g. GiftMe Royal Brass Key Dock"
                className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                  Category *
                </label>
                <button
                  type="button"
                  onClick={() => setIsManagingCategories(!isManagingCategories)}
                  className="text-[11px] font-semibold text-gold-700 hover:text-charcoal flex items-center gap-1 underline cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" /> {isManagingCategories ? 'Close Editor' : 'Edit Options'}
                </button>
              </div>

              {!isCustomCategory ? (
                <select
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === '__CUSTOM__') {
                      setIsCustomCategory(true);
                      setCustomCategoryInput('');
                    } else {
                      setFormData({ ...formData, category: e.target.value });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold font-medium"
                >
                  {categoryList.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="__CUSTOM__" className="font-bold text-gold-700">➕ Add Custom Category...</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCategoryInput}
                    onChange={(e) => {
                      setCustomCategoryInput(e.target.value);
                      setFormData({ ...formData, category: e.target.value });
                    }}
                    placeholder="Type custom category name..."
                    className="flex-1 px-3 py-3 rounded-xl bg-cream-200 border border-gold text-xs font-semibold text-charcoal focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customCategoryInput.trim()) {
                        addCategory(customCategoryInput.trim());
                        setCategoryList(getCategories());
                      }
                      setIsCustomCategory(false);
                    }}
                    className="px-3 py-3 bg-charcoal text-gold text-xs font-bold rounded-xl hover:bg-gold hover:text-charcoal-950 transition-colors shrink-0"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* Category Options Editor Panel */}
            {isManagingCategories && (
              <div className="sm:col-span-2 bg-cream-200/80 p-3 sm:p-4 rounded-2xl border border-gold/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cream-300 pb-2 gap-1">
                  <span className="text-xs font-bold text-charcoal flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-gold-700" /> Manage & Edit Category Options
                  </span>
                  <span className="text-[10px] text-stone-warm">Changes save automatically across site</span>
                </div>

                {/* Add New Category Option */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={newCategoryOption}
                    onChange={(e) => setNewCategoryOption(e.target.value)}
                    placeholder="Add new category option..."
                    className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-cream-100 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCategoryOption.trim()) {
                        addCategory(newCategoryOption.trim());
                        setCategoryList(getCategories());
                        setNewCategoryOption('');
                      }
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-gold text-charcoal-950 text-xs font-bold rounded-lg hover:bg-gold-400 transition-colors text-center"
                  >
                    Add Option
                  </button>
                </div>

                {/* List of categories with edit/delete */}
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {categoryList.map((cat, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-cream-100 p-2.5 sm:px-3 sm:py-2 rounded-lg border border-cream-300 gap-2">
                      {editingCategoryIndex === idx ? (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                          <input
                            type="text"
                            value={editingCategoryName}
                            onChange={(e) => setEditingCategoryName(e.target.value)}
                            className="w-full sm:flex-1 px-2.5 py-1.5 bg-white border border-gold rounded text-xs text-charcoal focus:outline-none"
                            autoFocus
                          />
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                if (editingCategoryName.trim()) {
                                  const oldName = categoryList[idx];
                                  const newName = editingCategoryName.trim();
                                  await renameCategory(oldName, newName);
                                  const updated = getCategories();
                                  setCategoryList(updated);
                                  if (formData.category === oldName) {
                                    setFormData({ ...formData, category: newName });
                                  }
                                }
                                setEditingCategoryIndex(null);
                              }}
                              className="flex-1 sm:flex-none text-[11px] font-bold text-emerald-700 hover:text-emerald-800 px-3 py-1 bg-emerald-100/80 rounded text-center"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategoryIndex(null)}
                              className="flex-1 sm:flex-none text-[11px] font-semibold text-stone-warm hover:text-charcoal px-3 py-1 bg-cream-200 rounded text-center"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-xs font-bold text-charcoal truncate w-full sm:w-auto">{cat}</span>
                          <div className="flex items-center justify-end gap-1.5 w-full sm:w-auto pt-1 sm:pt-0 border-t sm:border-0 border-cream-200/80">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategoryIndex(idx);
                                setEditingCategoryName(cat);
                              }}
                              className="flex-1 sm:flex-none py-1 px-2 rounded bg-cream-200/60 hover:bg-gold hover:text-charcoal-950 text-stone-warm hover:text-gold-700 transition-colors flex items-center justify-center gap-1 text-[11px] font-medium"
                              title="Rename Category"
                            >
                              <RefreshCw className="w-3 h-3" /> <span className="sm:hidden">Rename</span>
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                await deleteCategory(cat, 'General');
                                const updated = getCategories();
                                setCategoryList(updated);
                                if (formData.category === cat && updated.length > 0) {
                                  setFormData({ ...formData, category: updated[0] });
                                }
                              }}
                              className="flex-1 sm:flex-none py-1 px-2 rounded bg-red-500/10 hover:bg-red-500/20 text-red-600 transition-colors flex items-center justify-center gap-1 text-[11px] font-medium"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3 h-3" /> <span className="sm:hidden">Delete</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="1499"
                  className="w-full px-3 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gold-700 mb-1.5">
                  Offer Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.offer_price}
                  onChange={(e) => setFormData({ ...formData, offer_price: e.target.value })}
                  placeholder="899"
                  className="w-full px-3 py-3 rounded-xl bg-cream-200 border border-gold text-xs font-bold text-charcoal focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>
            </div>

            <div className="sm:col-span-2 bg-cream-200/80 p-3.5 rounded-xl border border-cream-300 flex items-center justify-between">
              <div>
                <span className="block text-xs font-bold uppercase tracking-wider text-charcoal">
                  Inventory Stock Status
                </span>
                <span className="text-[11px] text-stone-warm">
                  Set whether this product is available for customers to order
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, in_stock: true })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.in_stock !== false
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-cream-100 text-stone-warm hover:bg-cream-300'
                  }`}
                >
                  🟢 In Stock
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, in_stock: false })}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    formData.in_stock === false
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-cream-100 text-stone-warm hover:bg-cream-300'
                  }`}
                >
                  🔴 Out of Stock
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal mb-1.5">
                Product Description
              </label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe key features, hardware finish, and craftsmanship details..."
                className="w-full px-4 py-3 rounded-xl bg-cream-200 border border-cream-300 text-xs text-charcoal focus:outline-none focus:border-gold leading-relaxed"
              ></textarea>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-300">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-cream-200 text-charcoal text-xs font-semibold hover:bg-cream-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-3 rounded-xl bg-gold hover:bg-gold-400 text-charcoal-950 font-bold text-xs tracking-wide transition-all shadow-luxury active:scale-98 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? 'Saving to Database...' : productToEdit ? 'Update Product' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={cropperState.isOpen}
        imageSrc={cropperState.imageSrc}
        onClose={() => setCropperState({ ...cropperState, isOpen: false })}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
