import React from 'react';
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

// Storefront Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import ContactUs from './pages/ContactUs';
import CartPage from './pages/CartPage';
import Checkout from './pages/Checkout';
import WishlistPage from './pages/WishlistPage';

// Admin CMS Pages & Layout
import AdminRoute from './components/admin/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import CategoryManagement from './pages/admin/CategoryManagement';

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <Router>
            <ScrollToTopRoute />
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
                      <Routes>
                        <Route path="/" element={<Shop />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                      </Routes>
                    </main>
                    <Footer />
                    <CartDrawer />
                    <FloatingWhatsApp />
                    <ScrollToTop />
                  </div>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;
