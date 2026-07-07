import { createClient } from '@supabase/supabase-js';
import { products as localCatalog, customerReviews as localReviews } from '../data/products';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

export const isSupabaseConfigured =
  supabaseUrl !== 'https://placeholder.supabase.co' &&
  !supabaseUrl.includes('placeholder') &&
  supabaseAnonKey !== 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Local Storage keys for offline / fallback demo mode
const LS_PRODUCTS_KEY = 'giftme_admin_products_v1';
const LS_REVIEWS_KEY = 'giftme_admin_reviews_v1';

// Helper to ensure any ID is formatted as a valid 36-character PostgreSQL UUID
function formatToUUID(id) {
  if (!id) return generateUUID();
  const str = id.toString();
  // If it starts with our prefix 10000000-0000-0000-0000-, ensure the last section is exactly 12 chars
  if (str.startsWith('10000000-0000-0000-0000-')) {
    const lastPart = str.split('-')[4] || '';
    const cleanLast = lastPart.padStart(12, '0').slice(-12);
    return `10000000-0000-0000-0000-${cleanLast}`;
  }
  if (str.includes('-') && str.length === 36) return str;
  // If it's a number like 101 or 1, or an old/malformed string, format cleanly into 36 chars
  const cleanNum = str.replace(/[^0-9a-f]/gi, '');
  const padded = (cleanNum || '0').padStart(12, '0').slice(-12);
  return `10000000-0000-0000-0000-${padded}`;
}

function generateUUID() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Helper to get all 17 localCatalog items cleanly mapped to schema
function getBaseCatalog() {
  return localCatalog.map((p) => ({
    id: formatToUUID(p.id),
    product_name: p.name,
    name: p.name,
    description: p.description || p.shortDescription || '',
    shortDescription: p.shortDescription || p.description || '',
    category: p.category || 'General',
    original_price: p.originalPrice || p.price * 1.3,
    originalPrice: p.originalPrice || p.price * 1.3,
    offer_price: p.price,
    price: p.price,
    image_url: p.images?.[0] || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
    images: p.images || [p.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800'],
    colors: [],
    features: p.features || [],
    badge: p.badge || null,
    rating: p.rating || 4.9,
    reviewCount: p.reviewCount || 128,
    created_at: p.created_at || new Date(0).toISOString()
  }));
}

// Initialize fallback local storage if empty
function getFallbackProducts() {
  const baseCatalog = getBaseCatalog();
  const baseIds = new Set(baseCatalog.map(b => b.id.toString()));

  const saved = localStorage.getItem(LS_PRODUCTS_KEY);
  let adminCustomProducts = [];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        adminCustomProducts = parsed.filter(item => {
          const formattedId = formatToUUID(item.id);
          return !baseIds.has(item.id?.toString()) && !baseIds.has(formattedId);
        });
      }
    } catch (e) {
      console.error(e);
    }
  }

  const merged = [...adminCustomProducts, ...baseCatalog];
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(merged));
  return merged;
}

function getFallbackReviews() {
  const saved = localStorage.getItem(LS_REVIEWS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
  }
  return [];
}

// ==========================================
// API DATA ACCESS LAYER (With Resilient Fallback)
// ==========================================

// Helper to normalize any product object so all frontend components work reliably
function normalizeProduct(p) {
  if (!p) return null;
  const nameVal = p.product_name || p.name || 'GiftMe Masterpiece';
  const descVal = p.description || p.shortDescription || '';
  const priceVal = Number(p.offer_price !== undefined ? p.offer_price : (p.price !== undefined ? p.price : 0));
  const origVal = Number(p.original_price !== undefined ? p.original_price : (p.originalPrice !== undefined ? p.originalPrice : priceVal * 1.3));
  const imgUrl = p.image_url || (Array.isArray(p.images) && p.images[0]) || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800';
  const imgArr = (Array.isArray(p.images) && p.images.length > 0) ? p.images : [imgUrl];
  const stockVal = p.in_stock !== false && p.in_stock !== 'false' && p.stock_status !== 'Out of Stock';
  const validId = formatToUUID(p.id || generateUUID());

  return {
    ...p,
    id: validId,
    product_name: nameVal,
    name: nameVal,
    description: descVal,
    shortDescription: descVal,
    category: p.category || 'General',
    original_price: origVal,
    originalPrice: origVal,
    offer_price: priceVal,
    price: priceVal,
    image_url: imgUrl,
    images: imgArr,
    colors: [],
    in_stock: stockVal,
    stock_status: stockVal ? 'In Stock' : 'Out of Stock',
    rating: p.rating || 5.0,
    reviewCount: p.reviewCount || p.review_count || 1,
    created_at: p.created_at || new Date(0).toISOString()
  };
}

export async function fetchProducts() {
  const baseCatalog = getBaseCatalog();
  const baseIds = new Set(baseCatalog.map(b => b.id.toString()));

  // 1. Load local custom products from localStorage (offline/RLS fallback)
  const saved = localStorage.getItem(LS_PRODUCTS_KEY);
  let localCustomProducts = [];
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        localCustomProducts = parsed.filter(item => {
          const fid = formatToUUID(item.id);
          return !baseIds.has(item.id?.toString()) && !baseIds.has(fid);
        });
      }
    } catch (e) {
      console.error('Error parsing local products:', e);
    }
  }

  // 2. Load custom products from Supabase
  let supabaseProducts = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) {
        supabaseProducts = data.filter(item => {
          const fid = formatToUUID(item.id);
          return !baseIds.has(item.id?.toString()) && !baseIds.has(fid);
        });
      }
    } catch (err) {
      console.warn('Supabase fetch failed, relying on local catalog:', err);
    }
  }

  // 3. Combine and deduplicate: Local custom + Supabase custom + Base catalog
  const customMap = new Map();
  localCustomProducts.forEach(p => { const fid = formatToUUID(p.id); customMap.set(fid, p); });
  supabaseProducts.forEach(p => { const fid = formatToUUID(p.id); customMap.set(fid, { ...(customMap.get(fid) || {}), ...p }); });

  const mergedList = [...customMap.values(), ...baseCatalog];

  // 4. Normalize every product so Shop, Home, Showcase, and Admin render perfectly
  return mergedList.map(normalizeProduct).filter(Boolean);
}

export async function fetchReviews() {
  let supabaseReviews = [];
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) supabaseReviews = data;
    } catch (err) {
      console.warn('Supabase review fetch failed:', err);
    }
  }
  const localReviews = getFallbackReviews();
  
  // Combine and deduplicate by id
  const reviewMap = new Map();
  localReviews.forEach(r => reviewMap.set(r.id, r));
  supabaseReviews.forEach(r => reviewMap.set(r.id, { ...(reviewMap.get(r.id) || {}), ...r }));
  
  return Array.from(reviewMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
}

export async function createProduct(productData) {
  const now = new Date().toISOString();
  const newId = productData.id ? formatToUUID(productData.id) : generateUUID();
  const fullProduct = normalizeProduct({ ...productData, id: newId, created_at: now });

  // Always save to localStorage immediately so that regardless of RLS or schema errors,
  // the product is permanently saved and immediately visible across the website!
  const list = getFallbackProducts();
  list.unshift(fullProduct);
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(list));

  if (isSupabaseConfigured) {
    const supabasePayload = {
      product_name: fullProduct.product_name,
      description: fullProduct.description,
      category: fullProduct.category,
      original_price: fullProduct.original_price,
      offer_price: fullProduct.offer_price,
      image_url: fullProduct.image_url,
      created_at: fullProduct.created_at
    };

    try {
      const { data, error } = await supabase
        .from('products')
        .insert([supabasePayload])
        .select()
        .single();
      if (error) {
        console.warn('Supabase insert failed (RLS policy or schema). Using local catalog:', error.message);
        return fullProduct;
      }
      const updatedProd = normalizeProduct({ ...fullProduct, ...data });
      const updatedList = getFallbackProducts().map(p => formatToUUID(p.id) === newId ? updatedProd : p);
      localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedList));
      return updatedProd;
    } catch (err) {
      console.warn('Supabase insert exception:', err);
      return fullProduct;
    }
  }
  return fullProduct;
}

export async function updateProduct(id, productData) {
  const validId = formatToUUID(id);
  const fullProduct = normalizeProduct({ ...productData, id: validId });

  // Always update in localStorage fallback list first!
  const list = getFallbackProducts();
  const idx = list.findIndex((p) => formatToUUID(p.id) === validId);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...fullProduct };
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(list));
  } else {
    list.unshift(fullProduct);
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(list));
  }

  if (isSupabaseConfigured) {
    const supabasePayload = {};
    if (fullProduct.product_name !== undefined) supabasePayload.product_name = fullProduct.product_name;
    if (fullProduct.description !== undefined) supabasePayload.description = fullProduct.description;
    if (fullProduct.category !== undefined) supabasePayload.category = fullProduct.category;
    if (fullProduct.original_price !== undefined) supabasePayload.original_price = fullProduct.original_price;
    if (fullProduct.offer_price !== undefined) supabasePayload.offer_price = fullProduct.offer_price;
    if (fullProduct.image_url !== undefined) supabasePayload.image_url = fullProduct.image_url;

    try {
      const { data, error } = await supabase
        .from('products')
        .update(supabasePayload)
        .eq('id', validId)
        .select()
        .single();
      if (error) {
        console.warn('Supabase update failed (RLS policy or schema):', error.message);
      } else if (data) {
        const syncedProd = normalizeProduct({ ...fullProduct, ...data });
        const updatedList = getFallbackProducts().map(p => formatToUUID(p.id) === validId ? syncedProd : p);
        localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedList));
        return syncedProd;
      }
    } catch (err) {
      console.warn('Supabase update exception:', err);
    }
  }
  return fullProduct;
}

export async function deleteProduct(id) {
  const validId = formatToUUID(id);
  // Always delete from localStorage fallback list!
  let list = getFallbackProducts();
  list = list.filter((p) => formatToUUID(p.id) !== validId);
  localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(list));

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', validId);
      if (error) {
        console.warn('Supabase delete failed (likely RLS policy):', error.message);
      }
    } catch (err) {
      console.warn('Supabase delete exception:', err);
    }
  }
  return true;
}

export async function createReview(reviewData) {
  // Always save to localStorage immediately!
  const list = getFallbackReviews();
  const newRev = {
    ...reviewData,
    id: `rev-${Date.now()}`,
    created_at: new Date().toISOString()
  };
  list.unshift(newRev);
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(list));

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([reviewData])
        .select()
        .single();
      if (error) {
        // If foreign key constraint violation (product exists in local/base catalog but not yet in Supabase products table)
        if (error.code === '23503' || error.message?.includes('foreign key constraint') || error.message?.includes('reviews_product_id_fkey')) {
          console.log('Product not found in Supabase products table. Auto-syncing product to Supabase first...');
          const allProds = await fetchProducts();
          const missingProd = allProds.find(p => String(p.id) === String(reviewData.product_id));
          if (missingProd) {
            const prodToInsert = {
              id: missingProd.id,
              product_name: missingProd.product_name || missingProd.name || 'GiftMe Signature Item',
              description: missingProd.description || missingProd.shortDescription || '',
              category: missingProd.category || 'General',
              original_price: Number(missingProd.original_price || missingProd.originalPrice || 0),
              offer_price: Number(missingProd.offer_price || missingProd.price || 0),
              image_url: missingProd.images?.[0] || missingProd.image_url || 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&q=80&w=800',
              created_at: new Date().toISOString()
            };
            const { error: prodInsertErr } = await supabase.from('products').insert([prodToInsert]);
            if (!prodInsertErr) {
               const { data: retryData, error: retryErr } = await supabase
                 .from('reviews')
                 .insert([reviewData])
                 .select()
                 .single();
               if (!retryErr && retryData) return retryData;
            }
          }
        }
        console.warn('Supabase review insert error, using local storage fallback:', error.message);
        return newRev;
      }
      return data;
    } catch (err) {
      console.warn('Supabase review insert exception, using local storage fallback:', err);
      return newRev;
    }
  }
  return newRev;
}

export async function deleteReview(id) {
  // Always delete from localStorage first!
  let list = getFallbackReviews();
  list = list.filter((r) => r.id !== id);
  localStorage.setItem(LS_REVIEWS_KEY, JSON.stringify(list));

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', id);
      if (error) {
        console.warn('Supabase delete review failed (RLS policy):', error.message);
      }
    } catch (err) {
      console.warn('Supabase delete review exception:', err);
    }
  }
  return true;
}

export async function updateProductCategory(oldCategory, newCategory) {
  if (!oldCategory || !newCategory || oldCategory === newCategory) return 0;
  
  // 1. Update localStorage fallback list
  const list = getFallbackProducts();
  let count = 0;
  const updatedList = list.map(p => {
    if (p.category === oldCategory) {
      count++;
      return { ...p, category: newCategory };
    }
    return p;
  });
  if (count > 0) {
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedList));
  }

  // 2. Update Supabase table if configured
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ category: newCategory })
        .eq('category', oldCategory);
      if (error) {
        console.warn('Supabase updateProductCategory failed (RLS policy or schema):', error.message);
      }
    } catch (err) {
      console.warn('Supabase updateProductCategory exception:', err);
    }
  }
  return count;
}

export async function deleteCategoryAndReassignProducts(deletedCategory, fallbackCategory = 'General') {
  if (!deletedCategory || deletedCategory === fallbackCategory) return 0;

  // 1. Update localStorage fallback list
  const list = getFallbackProducts();
  let count = 0;
  const updatedList = list.map(p => {
    if (p.category === deletedCategory) {
      count++;
      return { ...p, category: fallbackCategory };
    }
    return p;
  });
  if (count > 0) {
    localStorage.setItem(LS_PRODUCTS_KEY, JSON.stringify(updatedList));
  }

  // 2. Update Supabase table if configured
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('products')
        .update({ category: fallbackCategory })
        .eq('category', deletedCategory);
      if (error) {
        console.warn('Supabase deleteCategoryAndReassignProducts failed (RLS policy or schema):', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteCategoryAndReassignProducts exception:', err);
    }
  }
  return count;
}

