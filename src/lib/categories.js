import { updateProductCategory, deleteCategoryAndReassignProducts } from './supabase';

const DEFAULT_CATEGORIES = [
  'Custom Engraved',
  'Leather Keychains',
  'Metal Key Holders',
  'Smart Organizers',
  'Wall Key Holders',
  'General'
];

const LS_KEY = 'giftme_categories_v1';
const LS_DELETED_KEY = 'giftme_deleted_categories_v1';

export function getCategories(products = []) {
  let saved = [];
  let deleted = [];
  try {
    const rawSaved = localStorage.getItem(LS_KEY);
    if (rawSaved) {
      saved = JSON.parse(rawSaved);
    }
    const rawDeleted = localStorage.getItem(LS_DELETED_KEY);
    if (rawDeleted) {
      deleted = JSON.parse(rawDeleted);
    }
  } catch (e) {
    console.error('Error reading categories from localStorage:', e);
  }

  // Collect unique categories from products
  const productCats = (products || []).map(p => p && p.category).filter(Boolean);

  // Combine default, saved, and product categories, removing duplicates
  let combined = Array.from(new Set([...DEFAULT_CATEGORIES, ...saved, ...productCats]));

  // Remove any category that has been explicitly deleted by admin
  combined = combined.filter(cat => !deleted.includes(cat));

  // Ensure 'General' is always available as a safe fallback
  if (!combined.includes('General')) {
    combined.push('General');
  }

  return combined;
}

export function saveCategories(categories) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(categories));
  } catch (e) {
    console.error('Error saving categories to localStorage:', e);
  }
}

export function addCategory(categoryName) {
  if (!categoryName || !categoryName.trim()) return;
  const cleanName = categoryName.trim();
  try {
    let deleted = [];
    const rawDeleted = localStorage.getItem(LS_DELETED_KEY);
    if (rawDeleted) deleted = JSON.parse(rawDeleted);
    
    // If it was previously deleted, remove it from deleted list
    if (deleted.includes(cleanName)) {
      deleted = deleted.filter(c => c !== cleanName);
      localStorage.setItem(LS_DELETED_KEY, JSON.stringify(deleted));
    }

    let saved = [];
    const rawSaved = localStorage.getItem(LS_KEY);
    if (rawSaved) saved = JSON.parse(rawSaved);
    
    if (!saved.includes(cleanName)) {
      saved.push(cleanName);
      saveCategories(saved);
    }
  } catch (e) {
    console.error('Error adding category:', e);
  }
}

export async function renameCategory(oldName, newName) {
  if (!oldName || !newName || !oldName.trim() || !newName.trim() || oldName === newName) return 0;
  const cleanOld = oldName.trim();
  const cleanNew = newName.trim();

  try {
    // 1. Add oldName to deleted list
    let deleted = [];
    const rawDeleted = localStorage.getItem(LS_DELETED_KEY);
    if (rawDeleted) deleted = JSON.parse(rawDeleted);
    if (!deleted.includes(cleanOld) && cleanOld !== 'General') {
      deleted.push(cleanOld);
      localStorage.setItem(LS_DELETED_KEY, JSON.stringify(deleted));
    }
    // Remove newName from deleted if present
    deleted = deleted.filter(c => c !== cleanNew);
    localStorage.setItem(LS_DELETED_KEY, JSON.stringify(deleted));

    // 2. Update saved categories
    let saved = [];
    const rawSaved = localStorage.getItem(LS_KEY);
    if (rawSaved) saved = JSON.parse(rawSaved);
    saved = saved.map(c => c === cleanOld ? cleanNew : c);
    if (!saved.includes(cleanNew)) saved.push(cleanNew);
    saveCategories(Array.from(new Set(saved)));

    // 3. Update all products in Supabase and localStorage!
    const updatedCount = await updateProductCategory(cleanOld, cleanNew);
    return updatedCount;
  } catch (e) {
    console.error('Error renaming category:', e);
    return 0;
  }
}

export async function deleteCategory(categoryName, fallbackCategory = 'General') {
  if (!categoryName || !categoryName.trim() || categoryName === 'General') return 0;
  const cleanName = categoryName.trim();

  try {
    // 1. Add to deleted list in localStorage
    let deleted = [];
    const rawDeleted = localStorage.getItem(LS_DELETED_KEY);
    if (rawDeleted) deleted = JSON.parse(rawDeleted);
    if (!deleted.includes(cleanName)) {
      deleted.push(cleanName);
      localStorage.setItem(LS_DELETED_KEY, JSON.stringify(deleted));
    }

    // 2. Remove from saved categories
    let saved = [];
    const rawSaved = localStorage.getItem(LS_KEY);
    if (rawSaved) saved = JSON.parse(rawSaved);
    saved = saved.filter(c => c !== cleanName);
    saveCategories(saved);

    // 3. Reassign products in Supabase and localStorage to fallbackCategory
    const reassignedCount = await deleteCategoryAndReassignProducts(cleanName, fallbackCategory);
    return reassignedCount;
  } catch (e) {
    console.error('Error deleting category:', e);
    return 0;
  }
}

