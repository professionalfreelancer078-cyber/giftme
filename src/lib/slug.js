/**
 * Creates a clean, SEO-friendly URL slug from a product name.
 * e.g. "Custom Engraved Wooden Keychain" -> "custom-engraved-wooden-keychain"
 */
export function createSlug(name) {
  if (!name) return '';
  return name
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/(^-|-$)/g, '');    // Remove leading and trailing hyphens
}

/**
 * Returns the slug for a given product object.
 * Falls back to product ID if no valid name exists.
 */
export function getProductSlug(product) {
  if (!product) return '';
  const name = product.product_name || product.name || '';
  const slug = createSlug(name);
  return slug || (product.id ? product.id.toString() : '');
}

/**
 * Returns the full relative URL path for a product.
 * e.g. "/product/custom-engraved-wooden-keychain"
 */
export function getProductUrl(product) {
  if (!product) return '';
  const slug = getProductSlug(product);
  return `/product/${slug}`;
}
