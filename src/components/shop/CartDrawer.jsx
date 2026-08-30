import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import {
  selectCartItems, selectCartTotal, selectCartOpen,
  closeCart, removeFromCart, updateQuantity
} from '../../features/cart/cartSlice';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const isOpen = useSelector(selectCartOpen);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in"
        onClick={() => dispatch(closeCart())}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-sm sm:max-w-md bg-white border-l border-black/10 z-50 flex flex-col shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-black" />
            <h2 className="font-display font-bold text-lg text-black">Shopping Cart</h2>
            {items.length > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold font-mono">
                {items.length}
              </span>
            )}
          </div>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-2 rounded-lg text-gray-500 hover:text-black hover:bg-black/5 transition-all"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4 border border-black/5">
                <ShoppingBag size={28} className="text-gray-400" />
              </div>
              <p className="text-black font-bold text-base">Your cart is empty</p>
              <p className="text-gray-500 text-xs mt-1">Discover premium grooming essentials in our shop</p>
              <Link
                to="/shop"
                onClick={() => dispatch(closeCart())}
                className="btn-primary mt-6 text-xs py-2.5 px-6 inline-flex"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            Object.entries(
              items.reduce((acc, item) => {
                const storeName = item.vendorId?.storeName || item.vendorId?.name || 'Kapamu Direct';
                if (!acc[storeName]) acc[storeName] = [];
                acc[storeName].push(item);
                return acc;
              }, {})
            ).map(([storeName, storeItems]) => (
              <div key={storeName} className="mb-4 last:mb-0">
                <div className="flex items-center gap-1.5 mb-2 px-1 text-gray-500">
                  <span className="text-[11px] font-bold tracking-wider uppercase">Vendor: {storeName}</span>
                </div>
                <div className="space-y-2.5">
                  {storeItems.map(item => (
                    <div key={item._id} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-black/8 hover:border-black/20 transition-all">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shrink-0 overflow-hidden border border-black/5">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag size={18} className="text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="text-black text-sm font-bold truncate leading-tight">{item.name}</p>
                          <p className="text-black font-extrabold text-sm mt-0.5">
                            LKR {formatPrice((item.salePrice || item.price) * item.quantity)}
                          </p>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => item.quantity <= 1
                              ? dispatch(removeFromCart(item._id))
                              : dispatch(updateQuantity({ id: item._id, quantity: item.quantity - 1 }))
                            }
                            className="w-6 h-6 rounded-md bg-white border border-black/15 hover:bg-gray-100 text-black flex items-center justify-center transition-all"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-black text-xs font-bold w-5 text-center">{item.quantity}</span>
                          <button
                            onClick={() => dispatch(updateQuantity({ id: item._id, quantity: item.quantity + 1 }))}
                            className="w-6 h-6 rounded-md bg-white border border-black/15 hover:bg-gray-100 text-black flex items-center justify-center transition-all"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item._id))}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all self-start"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 border-t border-black/10 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm font-semibold">Subtotal</span>
              <span className="text-black font-extrabold text-xl">LKR {formatPrice(total)}</span>
            </div>
            <p className="text-green-700 text-xs flex items-center gap-1 font-semibold">✓ Free island-wide shipping available</p>
            <Link
              to="/checkout"
              onClick={() => dispatch(closeCart())}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => dispatch(closeCart())}
              className="btn-ghost w-full text-xs"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

