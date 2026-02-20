import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCartStore } from '../store/cartStore';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    isLoading,
    fetchCart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon
  } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (productId, currentQuantity, change) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      await updateItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      await clearCart();
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setIsApplying(true);
    await applyCoupon(couponInput);
    setCouponInput('');
    setIsApplying(false);
  };

  if (isLoading && !cart) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const items = cart?.items || [];


  // Calculate true subtotal from items
  const trueSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cart?.discount || 0;
  const taxableAmount = Math.max(0, trueSubtotal - discount);
  const tax = taxableAmount * 0.18; // 18% Tax
  const shipping = taxableAmount > 500 ? 0 : 50;
  const total = taxableAmount + tax + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBagIcon className="h-24 w-24 mx-auto text-gray-300 mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="card flex flex-col sm:flex-row gap-4"
              >
                {/* Product Image */}
                <div className="w-full sm:w-32 h-32 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.productImage || 'https://via.placeholder.com/150'}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <Link
                        to={`/products/${item.productId}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-primary-600"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Unit Price: ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center border rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity, -1)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="px-4 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity, 1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear Cart */}
            <div className="flex justify-end">
              <button
                onClick={handleClearCart}
                className="text-red-500 hover:text-red-600 font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({items.length} items)</span>
                  <span>₹{trueSubtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (18% GST)</span>
                  <span>₹{tax.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-sm text-primary-600">
                    Add ₹{(500 - taxableAmount).toLocaleString()} more for free shipping
                  </p>
                )}

                <div className="border-t dark:border-gray-700 pt-3">
                  <div className="flex justify-between font-semibold text-gray-900 dark:text-white text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                {cart?.appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
                    <span className="text-green-700 dark:text-green-400 font-medium">{cart.appliedCoupon}</span>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="input-field flex-1"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !couponInput}
                      className="btn-secondary whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary"
              >
                Proceed to Checkout
              </button>

              <Link
                to="/products"
                className="block text-center text-primary-600 hover:text-primary-700 mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
