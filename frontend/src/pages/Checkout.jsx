import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCardIcon, TruckIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { ordersAPI, paymentAPI, cartAPI } from '../services/api';
import toast from 'react-hot-toast';
import { TicketIcon } from '@heroicons/react/24/outline';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart, clearCart, applyCoupon, removeCoupon } = useCartStore();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
  });

  const [selectedAddressId, setSelectedAddressId] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (cart && cart.items?.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    setSelectedAddressId(''); // Clear selection when editing manually
  };

  const handleSelectSavedAddress = (address) => {
    setShippingAddress({
      fullName: `${user.firstName} ${user.lastName}`,
      phone: user.phone || '',
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
    });
    setSelectedAddressId(address.id);
  };

  const validateAddress = () => {
    const required = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'];
    for (const field of required) {
      if (!shippingAddress[field].trim()) {
        toast.error(`Please enter ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    return true;
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiateRazorpayPayment = async (orderId) => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // Create Razorpay order on backend
      const result = await paymentAPI.createRazorpayOrder(orderId);
      const { amount, currency, razorpayOrderId, id: paymentId } = result.data.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: amount.toString(),
        currency: currency,
        name: 'E-Commerce Store',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            const verificationData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: paymentId,
            };

            await paymentAPI.verifyRazorpayPayment(verificationData);
            toast.success('Payment successful!');
            await clearCart();
            navigate(`/orders/${orderId}`);
          } catch (error) {
            console.error('Payment verification failed:', error);
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        notes: {
          address: `${shippingAddress.street}, ${shippingAddress.city}`,
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error('Failed to initiate Razorpay:', error);
      toast.error('Failed to initiate payment gateway');
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) return;

    setIsLoading(true);
    try {
      const orderData = {
        shippingAddress,
        paymentMethod,
      };

      const response = await ordersAPI.create(orderData);
      const orderId = response.data.data.id;

      if (paymentMethod === 'COD') {
        await clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${orderId}`);
      } else {
        // Online payment
        await initiateRazorpayPayment(orderId);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(couponCode);
    setIsApplyingCoupon(false);
    setCouponCode('');
  };

  const handleRemoveCoupon = async () => {
    await removeCoupon();
  };

  if (!cart) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const items = cart.items || [];
  const subtotal = cart.totalPrice || 0;
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Checkout
      </h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
            1
          </div>
          <span className="ml-2 font-medium">Shipping</span>
        </div>
        <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
            2
          </div>
          <span className="ml-2 font-medium">Payment</span>
        </div>
        <div className={`w-24 h-1 mx-4 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
            3
          </div>
          <span className="ml-2 font-medium">Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Shipping Address */}
          {step === 1 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <TruckIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Shipping Address</h2>
              </div>

              {/* Saved Addresses */}
              {user?.addresses?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">
                    Select a saved address
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {user.addresses.map((address) => (
                      <button
                        key={address.id}
                        type="button"
                        onClick={() => handleSelectSavedAddress(address)}
                        className={`p-4 border rounded-xl text-left transition-all ${selectedAddressId === address.id
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/10 ring-1 ring-primary-600'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                          }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold">{address.city}, {address.state}</span>
                          {address.default && (
                            <span className="text-[10px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded font-bold uppercase">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="relative mt-8 mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or enter a new address</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={shippingAddress.zipCode}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={shippingAddress.street}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter street address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleAddressChange}
                    className="input-field"
                    placeholder="Enter state"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => validateAddress() && setStep(2)}
                  className="btn-primary"
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <CreditCardIcon className="h-6 w-6 text-primary-600" />
                <h2 className="text-xl font-semibold">Payment Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: 'COD', name: 'Cash on Delivery', desc: 'Pay when you receive your order' },
                  { id: 'RAZORPAY', name: 'Online Payment', desc: 'UPI, Card, Net Banking' },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === method.id
                      ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/10 ring-1 ring-primary-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-400'
                      }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-primary-600 mt-1"
                    />
                    <div className="ml-3">
                      <span className="font-semibold">{method.name}</span>
                      <p className="text-sm text-gray-500 mt-1">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Order Items</h2>
                <div className="divide-y dark:divide-gray-700">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-4 py-4">
                      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                        <img
                          src={item.productImage || 'https://via.placeholder.com/80'}
                          alt={item.productName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.productName}</h3>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {shippingAddress.fullName}<br />
                  {shippingAddress.street}<br />
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                  Phone: {shippingAddress.phone}
                </p>
              </div>

              <div className="card">
                <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {paymentMethod === 'COD' && 'Cash on Delivery'}
                  {paymentMethod === 'RAZORPAY' && 'Online Payment'}
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({items.length} items)</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                  <div className="flex items-center gap-1">
                    <TicketIcon className="h-4 w-4" />
                    <span>Discount ({cart.appliedCoupon})</span>
                  </div>
                  <span>-₹{cart.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t dark:border-gray-700 pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Coupon Application */}
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              {cart.appliedCoupon ? (
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <TicketIcon className="h-5 w-5" />
                    <span className="font-medium">{cart.appliedCoupon}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Have a coupon?</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="input-field py-2 text-sm"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={isApplyingCoupon || !couponCode}
                      className="btn-primary py-2 px-4 shadow-sm"
                    >
                      {isApplyingCoupon ? <LoadingSpinner size="sm" /> : 'Apply'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
