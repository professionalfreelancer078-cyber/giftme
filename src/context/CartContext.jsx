import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('giftme_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem('giftme_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const addToCart = (product, quantity = 1, selectedColor = '', customText = '') => {
    setCartItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.selectedColor === selectedColor && item.customText === customText
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const cartItemId = `${product.id}-${selectedColor}-${Date.now()}`;
        return [...prev, { cartItemId, product, quantity, selectedColor, customText }];
      }
    });

    showToast(`Added "${product.name}" to bag`);
    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (cartItemId) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
    showToast("Item removed from bag");
  };

  const updateQuantity = (cartItemId, newQty) => {
    if (newQty < 1) {
      removeFromCart(cartItemId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => (item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cartTotal,
        cartCount,
        toastMessage
      }}
    >
      {children}
      {/* Global Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-charcoal text-cream-100 px-6 py-3.5 rounded-2xl shadow-luxury-hover border border-gold/30 flex items-center gap-3 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
          <p className="text-sm font-medium tracking-wide">{toastMessage}</p>
        </div>
      )}
    </CartContext.Provider>
  );
};
