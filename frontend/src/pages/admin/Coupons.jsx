import { useState, useEffect } from 'react';
import {
    TicketIcon,
    PlusIcon,
    TrashIcon,
    PencilIcon,
    CalendarIcon,
    CheckBadgeIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const fetchCoupons = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getCoupons();
            setCoupons(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch coupons:', error);
            toast.error('Failed to load coupons');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        usageLimit: '',
        active: true
    });

    useEffect(() => {
        if (editingCoupon) {
            setFormData({
                ...editingCoupon,
                startDate: editingCoupon.startDate?.split('T')[0] || '',
                expiryDate: editingCoupon.expiryDate?.split('T')[0] || ''
            });
        } else {
            setFormData({
                code: '',
                discountType: 'PERCENTAGE',
                discountValue: '',
                minOrderAmount: '',
                maxDiscountAmount: '',
                startDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
                usageLimit: '',
                active: true
            });
        }
    }, [editingCoupon]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                discountValue: parseFloat(formData.discountValue),
                minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
                maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
                startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
                expiryDate: formData.expiryDate ? `${formData.expiryDate}T23:59:59` : null
            };

            if (editingCoupon) {
                await adminAPI.updateCoupon(editingCoupon.id, payload);
                toast.success('Coupon updated successfully');
            } else {
                await adminAPI.createCoupon(payload);
                toast.success('Coupon created successfully');
            }
            setIsModalOpen(false);
            fetchCoupons();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save coupon');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await adminAPI.deleteCoupon(id);
            toast.success('Coupon deleted');
            fetchCoupons();
        } catch (error) {
            toast.error('Failed to delete coupon');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in text-gray-900 dark:text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold dark:text-white flex items-center gap-3">
                    <TicketIcon className="h-8 w-8 text-indigo-600" />
                    Discount Coupons
                </h1>
                <button
                    onClick={() => {
                        setEditingCoupon(null);
                        setIsModalOpen(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create Coupon
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.length === 0 ? (
                        <div className="col-span-full card p-12 text-center text-gray-500">
                            <TicketIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                            <p>No active coupons found.</p>
                        </div>
                    ) : (
                        coupons.map((coupon) => (
                            <div key={coupon.id} className="card p-6 border-b-4 border-b-indigo-500 overflow-hidden relative group">
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditingCoupon(coupon);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-lg"
                                    >
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(coupon.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                                        <TicketIcon className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-wider text-gray-900 dark:text-white uppercase line-clamp-1 pr-14">
                                            {coupon.code}
                                        </h3>
                                        <span className={`text-[10px] font-bold uppercase ${coupon.active ? 'text-green-600' : 'text-red-500'}`}>
                                            {coupon.active ? 'Available' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm text-gray-500">Value</span>
                                        <span className="text-2xl font-black text-indigo-600">
                                            {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                                        </span>
                                    </div>
                                    <div className="h-px bg-gray-100 dark:bg-gray-700 w-full" />
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-500 font-medium">Min Order</span>
                                        <span className="font-bold">₹{coupon.minOrderAmount || 0}</span>
                                    </div>
                                    {(coupon.maxDiscountAmount) && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500 font-medium">Max Discount</span>
                                            <span className="font-bold">₹{coupon.maxDiscountAmount}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t dark:border-gray-700">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <CalendarIcon className="h-4 w-4" />
                                        <span>Exp: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                                    </div>
                                    <div className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Used: {coupon.usedCount || 0}/{coupon.usageLimit || '∞'}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-in">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    {editingCoupon ? <PencilIcon className="h-5 w-5 text-indigo-600" /> : <PlusIcon className="h-5 w-5 text-indigo-600" />}
                                    {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                                </h2>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Coupon Code</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono tracking-widest"
                                            placeholder="E.g. SUMMER50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Type</label>
                                        <select
                                            value={formData.discountType}
                                            onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        >
                                            <option value="PERCENTAGE">Percentage (%)</option>
                                            <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Value</label>
                                        <input
                                            required
                                            type="number"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder={formData.discountType === 'PERCENTAGE' ? 'E.g. 10' : 'E.g. 500'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Min Order Amount</label>
                                        <input
                                            type="number"
                                            value={formData.minOrderAmount}
                                            onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="E.g. 1000"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Max Discount</label>
                                        <input
                                            type="number"
                                            value={formData.maxDiscountAmount}
                                            onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="Optional"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                                        <input
                                            required
                                            type="date"
                                            value={formData.expiryDate}
                                            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usage Limit</label>
                                        <input
                                            type="number"
                                            value={formData.usageLimit}
                                            onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                            className="w-full bg-gray-50 dark:bg-gray-700/50 border dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="Total uses"
                                        />
                                    </div>
                                    <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                                        <input
                                            type="checkbox"
                                            id="active"
                                            checked={formData.active}
                                            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="active" className="text-sm font-medium">Coupon is active and available for use</label>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                                >
                                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
