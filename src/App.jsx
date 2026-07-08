import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopRoute from './components/ScrollToTopRoute';

// Core Storefront Pages (Synchronous for instant <1s FCP on mobile & desktop)
import Shop from './pages/Shop';
import Home from './pages/Home';

// Lazy load secondary storefront pages for fast FCP & small chunk sizes
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const CartPage = lazy(() => import('./pages/CartPage'));
const Checkout = lazy(() => import('./pages/Checkout'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));

// Lazy load heavy Admin CMS Pages & Layouts (isolates admin libraries from customer storefront!)
const AdminRoute = lazy(() => import('./components/admin/AdminRoute'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ProductManagement = lazy(() => import('./pages/admin/ProductManagement'));
const CategoryManagement = lazy(() => import('./pages/admin/CategoryManagement'));

const PageLoader = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center bg-cream-100 p-8">
    <div className="w-10 h-10 border-3 border-charcoal/20 border-t-gold rounded-full animate-spin"></div>
    <p className="mt-4 font-serif text-xs uppercase tracking-widest text-stone-warm animate-pulse">Loading GiftMe Experience...</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <ScrollToTopRoute />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Admin CMS Portal Routes (Isolated from customer header/footer) */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <Routes>
                          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="products" element={<ProductManagement />} />
                          <Route path="categories" element={<CategoryManagement />} />
                        </Routes>
                      </AdminLayout>
                    </AdminRoute>
                  }
                />

                {/* Public Customer Storefront Routes */}
                <Route
                  path="/*"
                  element={
                    <div className="min-h-screen flex flex-col bg-cream-100 text-charcoal font-sans selection:bg-gold-200">
                      <Navbar />
                      <main className="flex-1">
                        <Suspense fallback={<PageLoader />}>
                          <Routes>
                            <Route path="/" element={<Shop />} />
                            <Route path="/home" element={<Home />} />
                            <Route path="/shop" element={<Shop />} />
                            <Route path="/products" element={<Shop />} />
                            <Route path="/about" element={<AboutUs />} />
                            <Route path="/product/:id" element={<ProductDetails />} />
                            <Route path="/contact" element={<ContactUs />} />
                            <Route path="/cart" element={<CartPage />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/wishlist" element={<WishlistPage />} />
                          </Routes>
                        </Suspense>
                      </main>
                      <Footer />
                      <CartDrawer />
                      <FloatingWhatsApp />
                      <ScrollToTop />
                    </div>
                  }
                />
              </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;

