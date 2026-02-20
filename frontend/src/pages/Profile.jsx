import { useState, useEffect } from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, PencilIcon, PlusIcon, TrashIcon, CheckCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuthStore } from '../store/authStore';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { userAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, fetchProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
  });
  const [otpSent, setOtpSent] = useState(false);

  const [addressData, setAddressData] = useState({
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await userAPI.updateProfile(formData);
      await fetchProfile();
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!otpSent) {
      // Step 1: Initiate - Validate Current Password & Send OTP
      if (!passwordData.currentPassword) {
        toast.error('Current password is required');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.error('New password and confirm password do not match');
        return;
      }

      setIsLoading(true);
      try {
        await userAPI.initiateChangePassword({ currentPassword: passwordData.currentPassword });
        setOtpSent(true);
        toast.success('OTP sent to your email');
      } catch (error) {
        console.error('Failed to send OTP:', error);
        toast.error(error.response?.data?.message || 'Failed to send OTP');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Step 2: Complete - Verify OTP & Update Password
      if (!passwordData.otp) {
        toast.error('Please enter the OTP');
        return;
      }

      setIsLoading(true);
      try {
        await userAPI.changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
          otp: passwordData.otp
        });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '', otp: '' });
        setOtpSent(false);
        toast.success('Password changed successfully');
      } catch (error) {
        console.error('Failed to change password:', error);
        toast.error(error.response?.data?.message || 'Failed to change password');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress.id, addressData);
        toast.success('Address updated successfully');
      } else {
        await userAPI.addAddress(addressData);
        toast.success('Address added successfully');
      }
      await fetchProfile();
      closeAddressModal();
    } catch (error) {
      console.error('Failed to save address:', error);
      toast.error(error.response?.data?.message || 'Failed to save address');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await userAPI.deleteAddress(id);
      await fetchProfile();
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Failed to delete address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      await userAPI.setDefaultAddress(id);
      await fetchProfile();
      toast.success('Default address updated');
    } catch (error) {
      console.error('Failed to set default address:', error);
      toast.error('Failed to set default address');
    }
  };

  const openAddressModal = (address = null) => {
    if (address) {
      setEditingAddress(address);
      setAddressData({
        street: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        zipCode: address.zipCode,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setAddressData({
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        isDefault: false,
      });
    }
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          My Account
        </h1>
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {['general', 'addresses', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsEditing(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
            >
              <span className="capitalize">{tab}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'general' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">General Information</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary flex items-center gap-2">
                <PencilIcon className="h-4 w-4" />
                Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    className="input-field bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.firstName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="h-10 w-10 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold">My Addresses</h2>
            <button onClick={() => openAddressModal()} className="btn-primary flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add New
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.addresses?.length > 0 ? (
              user.addresses.map((address) => (
                <div key={address.id} className={`card p-4 relative border-2 ${address.isDefault ? 'border-primary-500' : 'border-transparent'}`}>
                  {address.isDefault && (
                    <span className="absolute top-4 right-4 bg-primary-100 text-primary-600 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      Default
                    </span>
                  )}
                  <div className="pr-12">
                    <p className="font-medium">{address.street}</p>
                    <p className="text-gray-500">
                      {address.city}, {address.state} {address.zipCode}
                    </p>
                    <p className="text-gray-500">{address.country}</p>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t dark:border-gray-700">
                    <button onClick={() => openAddressModal(address)} className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteAddress(address.id)} className="text-red-600 hover:text-red-700 text-sm font-medium">
                      Delete
                    </button>
                    {!address.isDefault && (
                      <button onClick={() => handleSetDefaultAddress(address.id)} className="text-primary-600 hover:text-primary-700 text-sm font-medium ml-auto">
                        Set Default
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="md:col-span-2 card p-8 text-center text-gray-500">
                No addresses saved yet.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <KeyIcon className="h-5 w-5" />
            Security Settings
          </h2>
          <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="input-field"
                required
                disabled={otpSent}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="input-field"
                required
                disabled={otpSent}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="input-field"
                required
                disabled={otpSent}
              />
            </div>

            {otpSent && (
              <div className="animate-fade-in pt-2">
                <label className="block text-sm font-medium mb-1">Enter OTP sent to your email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    value={passwordData.otp}
                    onChange={handlePasswordChange}
                    className="input-field pl-10 tracking-widest"
                    placeholder="000000"
                    required
                    maxLength={6}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  OTP is valid for 2 minutes.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-4">
              {otpSent && (
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="btn-secondary flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              )}
              <button type="submit" disabled={isLoading} className="btn-primary w-full mt-4 flex-1">
                {isLoading ? <LoadingSpinner size="sm" /> : (otpSent ? 'Verify & Update' : 'Update Password')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl animate-scale-up">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
              <button onClick={closeAddressModal} className="text-gray-500 hover:text-gray-700">&times;</button>
            </div>
            <form onSubmit={handleAddressSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={addressData.street}
                  onChange={handleAddressChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={addressData.country}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={addressData.zipCode}
                    onChange={handleAddressChange}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={addressData.isDefault}
                  onChange={handleAddressChange}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium">Set as default address</label>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeAddressModal} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 btn-primary">
                  {isLoading ? <LoadingSpinner size="sm" /> : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
