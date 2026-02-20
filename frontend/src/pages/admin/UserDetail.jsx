import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftIcon,
    EnvelopeIcon,
    PhoneIcon,
    UserCircleIcon,
    ShoppingBagIcon,
    NoSymbolIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function UserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [userRes, ordersRes] = await Promise.all([
                adminAPI.getUserById(id),
                adminAPI.getUserOrders(id)
            ]);
            setUser(userRes.data.data);
            setOrders(ordersRes.data.data);
            setFormData({
                firstName: userRes.data.data.firstName || '',
                lastName: userRes.data.data.lastName || '',
                phone: userRes.data.data.phone || '',
                street: userRes.data.data.address?.street || '',
                city: userRes.data.data.address?.city || '',
                state: userRes.data.data.address?.state || '',
                zipCode: userRes.data.data.address?.zipCode || '',
                country: userRes.data.data.address?.country || ''
            });
        } catch (error) {
            console.error('Failed to fetch user details:', error);
            toast.error('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await adminAPI.updateUser(id, formData);
            toast.success('User updated successfully');
            setIsEditing(false);
            fetchData();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        }
    };

    const handleToggleStatus = async () => {
        try {
            await adminAPI.toggleUserStatus(id);
            toast.success(`User ${user.active ? 'deactivated' : 'activated'}`);
            fetchData();
        } catch (error) {
            console.error('Failed to update user status:', error);
            toast.error('Failed to update user status');
        }
    };

    if (isLoading) return (
        <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
        </div>
    );

    if (!user) return (
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-gray-500">
            User not found
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <button
                onClick={() => navigate('/admin/users')}
                className="flex items-center text-gray-600 hover:text-primary-600 mb-6"
            >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Users
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                        <UserCircleIcon className="h-10 w-10 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {user.firstName} {user.lastName}
                        </h1>
                        <p className="text-gray-500">{user.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleToggleStatus}
                        className={`btn-${user.active ? 'danger' : 'success'} flex items-center gap-2`}
                    >
                        {user.active ? (
                            <NoSymbolIcon className="h-4 w-4" />
                        ) : (
                            <CheckCircleIcon className="h-4 w-4" />
                        )}
                        {user.active ? 'Deactivate User' : 'Activate User'}
                    </button>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="btn-secondary"
                    >
                        {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Stats & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Account Details</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <EnvelopeIcon className="h-5 w-5" />
                                <span>{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <PhoneIcon className="h-5 w-5" />
                                <span>{user.phone || 'No phone provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                <ShoppingBagIcon className="h-5 w-5" />
                                <span>{orders.length} Orders</span>
                            </div>
                            <div className="pt-4 border-t dark:border-gray-700">
                                <p className="text-sm text-gray-500 uppercase font-semibold">Joined</p>
                                <p className="text-gray-900 dark:text-white">
                                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Address</h2>
                        <div className="text-gray-600 dark:text-gray-400">
                            {user.address ? (
                                <address className="not-italic">
                                    {user.address.street}<br />
                                    {user.address.city}, {user.address.state} {user.address.zipCode}<br />
                                    {user.address.country}
                                </address>
                            ) : (
                                'No address provided'
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Form or Order History */}
                <div className="lg:col-span-2">
                    {isEditing ? (
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Edit User Profile</h2>
                            <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Zip Code
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Country
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.country}
                                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                        className="input-field"
                                    />
                                </div>
                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary px-8">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order History</h2>
                            {orders.length === 0 ? (
                                <div className="card text-center py-12 text-gray-500">
                                    This user hasn't placed any orders yet.
                                </div>
                            ) : (
                                <div className="card overflow-hidden p-0">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                                                <th className="px-6 py-3">Order #</th>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Items</th>
                                                <th className="px-6 py-3">Amount</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y dark:divide-gray-700">
                                            {orders.map((order) => (
                                                <tr
                                                    key={order.id}
                                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                                                    onClick={() => navigate(`/admin/orders/${order.id}`)}
                                                >
                                                    <td className="px-6 py-4 font-medium text-primary-600">
                                                        #{order.orderNumber || order.id.substring(0, 8).toUpperCase()}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                                        {order.items?.length || 0} items
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                                                        ₹{order.totalAmount || order.totalPrice}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                                                order.orderStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                            }`}>
                                                            {order.orderStatus || order.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
