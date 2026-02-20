import { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell
} from 'recharts';
import {
    CalendarIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    CurrencyRupeeIcon,
    ShoppingCartIcon,
    UsersIcon,
    TrendingUpIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export default function Reports() {
    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0]
    });
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReport = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getReports(dateRange.start, dateRange.end);
            setData(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch reports');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [dateRange]);

    if (isLoading && !data) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

    const salesData = Object.entries(data?.salesReport?.dailySales || {}).map(([date, amount]) => ({
        date,
        amount
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const topProducts = data?.productPerformanceReport?.topProductsByRevenue || [];

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Reports & Analytics</h1>
                    <p className="text-gray-500 dark:text-gray-400">Track your store's performance and growth</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-2 rounded-xl border dark:border-gray-700 shadow-sm">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="bg-transparent border-none text-sm focus:ring-0 dark:text-white"
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="bg-transparent border-none text-sm focus:ring-0 dark:text-white"
                        />
                    </div>

                    <button
                        onClick={fetchReport}
                        className="p-2 border dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        <ArrowPathIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>

                    <button className="btn-primary flex items-center gap-2">
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Export
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                            <CurrencyRupeeIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Net Revenue</p>
                            <p className="text-2xl font-bold dark:text-white">₹{data?.revenueTaxReport?.netRevenue?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600">
                            <ShoppingCartIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold dark:text-white">{data?.salesReport?.totalOrders}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600">
                            <UsersIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">New Customers</p>
                            <p className="text-2xl font-bold dark:text-white">{data?.customerReport?.newCustomersThisMonth}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600">
                            <TrendingUpIcon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Profit Margin</p>
                            <p className="text-2xl font-bold dark:text-white">{data?.profitLossReport?.profitMarginPercentage}%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Sales Trend Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">Sales Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products Chart */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">Top Products by Revenue</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="productName" hide />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="revenueGenerated" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Customers Table */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">Top Customers</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs uppercase text-gray-500 border-b dark:border-gray-700">
                                    <th className="pb-4">Customer</th>
                                    <th className="pb-4">Orders</th>
                                    <th className="pb-4 text-right">Total Spent</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {data?.customerReport?.topCustomers?.map((customer) => (
                                    <tr key={customer.userId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="py-4">
                                            <p className="font-medium text-sm dark:text-white">{customer.name}</p>
                                            <p className="text-xs text-gray-500">{customer.email}</p>
                                        </td>
                                        <td className="py-4 text-sm dark:text-gray-300">{customer.totalOrders}</td>
                                        <td className="py-4 text-sm font-bold text-right dark:text-white">₹{customer.totalSpent.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Profit & Loss Summary */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 dark:text-white">Profit & Loss Analysis</h3>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="text-gray-500 dark:text-gray-400">Total Revenue</span>
                            <span className="font-bold text-lg dark:text-white">₹{data?.profitLossReport?.totalRevenue?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <span className="text-gray-500 dark:text-gray-400">Total Cost (COGS)</span>
                            <span className="font-bold text-lg text-red-500">-₹{data?.profitLossReport?.totalCost?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">Gross Profit</span>
                            <span className="font-bold text-xl text-indigo-600 dark:text-indigo-400">₹{data?.profitLossReport?.grossProfit?.toLocaleString()}</span>
                        </div>

                        <div className="p-4 border dark:border-gray-700 rounded-xl">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-gray-500">Profit Margin</span>
                                <span className="text-sm font-bold dark:text-white">{data?.profitLossReport?.profitMarginPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full"
                                    style={{ width: `${data?.profitLossReport?.profitMarginPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
