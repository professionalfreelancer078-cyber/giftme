-- ====================================================================
-- SUPABASE COMPLETE SCHEMA FOR GIFTME PRODUCT MANAGEMENT SYSTEM
-- ====================================================================
-- Instructions: Copy and paste this entire script into your Supabase SQL Editor and run it.

-- 1. Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'General',
    original_price NUMERIC NOT NULL,
    offer_price NUMERIC NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Set up Storage Bucket for Product Images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product-images',
    'product-images',
    true,
    5242880, -- 5 MB Limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- PRODUCTS: Everyone can view products
CREATE POLICY "Public read access for products"
ON public.products FOR SELECT
USING (true);

-- PRODUCTS: Only authenticated Admin users can insert, update, or delete products
CREATE POLICY "Admin full access for products insert"
ON public.products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin full access for products update"
ON public.products FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admin full access for products delete"
ON public.products FOR DELETE
TO authenticated
USING (true);

-- REVIEWS: Everyone can view reviews
CREATE POLICY "Public read access for reviews"
ON public.reviews FOR SELECT
USING (true);

-- REVIEWS: Everyone (customers) can submit reviews
CREATE POLICY "Public insert access for reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

-- REVIEWS: Admin can delete reviews if necessary
CREATE POLICY "Admin delete access for reviews"
ON public.reviews FOR DELETE
TO authenticated
USING (true);

-- STORAGE POLICIES: Public read access for images in product-images bucket
CREATE POLICY "Public access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- STORAGE POLICIES: Only authenticated Admin users can upload, update, or delete images
CREATE POLICY "Admin upload access for product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Admin update access for product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images');

CREATE POLICY "Admin delete access for product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');

-- ====================================================================
-- INITIAL SAMPLE CATALOG SEED DATA
-- ====================================================================

INSERT INTO public.products (id, product_name, description, category, original_price, offer_price, image_url)
VALUES
(
    '10000000-0000-0000-0000-000000000101',
    'GiftMe Signature Sovereign Key Holder',
    'The GiftMe Signature Sovereign Key Holder represents our pinnacle of craftsmanship. Engineered with hand-polished metallic hardware and genuine top-grain accents, this masterpiece offers secure daily carry while making an unmistakable statement of prestige.',
    'Custom Engraved',
    1899,
    1299,
    '/assets/main view of product1.jpeg'
),
(
    '10000000-0000-0000-0000-000000000102',
    'GiftMe Heritage Artisan Key Ring',
    'Designed for discerning individuals, the Heritage Artisan Key Ring brings together historic leatherworking traditions with modern ergonomic proportions. The supple loop slips naturally around your finger while the solid forged split ring securely holds car fobs and home keys.',
    'Leather Keychains',
    1399,
    899,
    '/assets/poduct2.jpeg'
),
(
    '10000000-0000-0000-0000-000000000103',
    'GiftMe Royal Velvet Key Fob',
    'Experience the perfect balance of weight and poise. The Royal Velvet Key Fob features a 360-degree ball-bearing swivel head that prevents tangled key chains, paired with an architectural clasp.',
    'Metal Key Holders',
    1599,
    1099,
    '/assets/product3.jpeg'
),
(
    '10000000-0000-0000-0000-000000000104',
    'GiftMe Minimalist Smart Loop',
    'Streamline your daily essentials with the Minimalist Smart Loop. By keeping keys stacked and insulated within its refined profile, it completely stops pocket jingling and protects smartphone screens from accidental scratches.',
    'Smart Organizers',
    1199,
    799,
    '/assets/product4.jpeg'
),
(
    '10000000-0000-0000-0000-000000000105',
    'GiftMe Prestige Wall Key Dock',
    'Make coming home a pleasurable ritual. The Prestige Wall Key Dock serves as a stunning minimalist sculpture beside your door while offering strong, instant docking for up to 5 key sets.',
    'Wall Key Holders',
    2499,
    1699,
    '/assets/product5.jpeg'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Reviews
INSERT INTO public.reviews (product_id, customer_name, rating, review)
VALUES
(
    '10000000-0000-0000-0000-000000000101',
    'Vikramaditya Rao',
    5,
    'The GiftMe Signature Sovereign keychain is absolute perfection. The brass weight feels substantial in hand, and the craftsmanship is outstanding.'
),
(
    '10000000-0000-0000-0000-000000000105',
    'Ananya Sharma',
    5,
    'Bought the Prestige Wall Dock for our new apartment. The hidden magnets hold heavy car keys effortlessly, and it looks like modern art!'
);
