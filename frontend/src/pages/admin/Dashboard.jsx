import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  CubeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ExclamationTriangleIcon,
  FireIcon,
  ClockIcon,
  CheckCircleIcon,
  TruckIcon,
  XCircleIcon,
  ChatBubbleLeftEllipsisIcon,
  CreditCardIcon,
  ArchiveBoxIcon,
  TicketIcon,
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revenueTab, setRevenueTab] = useState('monthly');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await adminAPI.getDashboardStats();
        if (statsRes.data?.data) {
          setStats(statsRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }

      try {
        const ordersRes = await adminAPI.getOrders({ size: 5, sortBy: 'createdAt', sortDir: 'desc' });
        setRecentOrders(ordersRes.data?.data?.content || []);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }

      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingBagIcon,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Total Customers',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50',
    },
    {
      title: 'Active Products',
      value: stats?.activeProducts || 0,
      icon: CubeIcon,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50',
    },
  ];

  const getRevenueValue = () => {
    switch (revenueTab) {
      case 'daily': return stats?.dailyRevenue || 0;
      case 'monthly': return stats?.monthlyRevenue || 0;
      case 'yearly': return stats?.yearlyRevenue || 0;
      default: return 0;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      PROCESSING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
      SHIPPED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      DELIVERED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const orderStatusItems = [
    { label: 'Pending', count: stats?.pendingOrders || 0, icon: ClockIcon, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Confirmed', count: stats?.confirmedOrders || 0, icon: CheckCircleIcon, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Processing', count: stats?.processingOrders || 0, icon: ArrowTrendingUpIcon, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Shipped', count: stats?.shippedOrders || 0, icon: TruckIcon, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Delivered', count: stats?.completedOrders || 0, icon: CheckCircleIcon, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Cancelled', count: stats?.cancelledOrders || 0, icon: XCircleIcon, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's an overview of your store performance.
        </p>
      </div>

      {/* ── Stat Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 bg-gradient-to-br ${stat.color}`} />
            <div className="relative">
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${stat.color} mb-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Revenue Statistics ──────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CurrencyRupeeIcon className="h-5 w-5 text-emerald-500" />
              Revenue Statistics
            </h2>
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {['daily', 'monthly', 'yearly'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setRevenueTab(tab)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${revenueTab === tab
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
                    }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="text-center py-8">
            <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              {revenueTab === 'daily' ? "Today's Revenue" : revenueTab === 'monthly' ? "This Month's Revenue" : "This Year's Revenue"}
            </p>
            <p className="text-5xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              ₹{Number(getRevenueValue()).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t dark:border-gray-700">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Daily</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                ₹{Number(stats?.dailyRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center border-x dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monthly</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                ₹{Number(stats?.monthlyRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Yearly</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                ₹{Number(stats?.yearlyRevenue || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ShoppingBagIcon className="h-5 w-5 text-blue-500" />
            Order Summary
          </h2>
          <div className="space-y-3">
            {orderStatusItems.map((item, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg ${item.bg}`}>
                <div className="flex items-center gap-3">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                </div>
                <span className={`text-lg font-bold ${item.color}`}>{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Top Selling + Low Stock ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Top Selling Products */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-orange-500" />
            Top Selling Products
          </h2>
          {(!stats?.topSellingProducts || stats.topSellingProducts.length === 0) ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FireIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No sales data yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.topSellingProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CubeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.totalSold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(product.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
            Low Stock Alerts
            {stats?.lowStockProducts > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                {stats.lowStockProducts}
              </span>
            )}
          </h2>
          {(!stats?.lowStockAlerts || stats.lowStockAlerts.length === 0) ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <CheckCircleIcon className="h-12 w-12 mx-auto mb-3 text-green-400 opacity-50" />
              <p>All products are well-stocked!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.lowStockAlerts.map((product) => (
                <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CubeIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">₹{Number(product.price || 0).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${product.stockQuantity === 0
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                      : product.stockQuantity <= 5
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400'
                      }`}>
                      {product.stockQuantity === 0 ? 'Out of Stock' : `${product.stockQuantity} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Orders + Quick Actions ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  <th className="pb-3">Order</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-gray-500">
                      No recent orders
                    </td>
                  </tr>
                ) : recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                      >
                        #{order.orderNumber || order.id?.substring(0, 8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                      {order.userName || order.userEmail || 'Customer'}
                    </td>
                    <td className="py-3 font-medium text-sm">
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.orderStatus || order.status)}`}>
                        {order.orderStatus || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/admin/products/new"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center group"
            >
              <CubeIcon className="h-8 w-8 mx-auto mb-2 text-primary-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Add Product</span>
            </Link>
            <Link
              to="/admin/categories"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-center group"
            >
              <CubeIcon className="h-8 w-8 mx-auto mb-2 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Categories</span>
            </Link>
            <Link
              to="/admin/orders"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-center group"
            >
              <ShoppingBagIcon className="h-8 w-8 mx-auto mb-2 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Orders</span>
            </Link>
            <Link
              to="/admin/users"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all text-center group"
            >
              <UsersIcon className="h-8 w-8 mx-auto mb-2 text-violet-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Users</span>
            </Link>
            <Link
              to="/admin/transactions"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-center group"
            >
              <CreditCardIcon className="h-8 w-8 mx-auto mb-2 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Transactions</span>
            </Link>
            <Link
              to="/admin/complaints"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-center group"
            >
              <ChatBubbleLeftEllipsisIcon className="h-8 w-8 mx-auto mb-2 text-red-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Complaints</span>
            </Link>
            <Link
              to="/admin/inventory"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all text-center group"
            >
              <ArchiveBoxIcon className="h-8 w-8 mx-auto mb-2 text-primary-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Inventory</span>
            </Link>
            <Link
              to="/admin/coupons"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all text-center group"
            >
              <TicketIcon className="h-8 w-8 mx-auto mb-2 text-indigo-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Coupons</span>
            </Link>
            <Link
              to="/admin/reports"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-center group"
            >
              <ChartBarIcon className="h-8 w-8 mx-auto mb-2 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Reports</span>
            </Link>
            <Link
              to="/admin/management"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-center group"
            >
              <UserGroupIcon className="h-8 w-8 mx-auto mb-2 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Staff Roles</span>
            </Link>
            <Link
              to="/admin/logs"
              className="p-5 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-center group"
            >
              <ClipboardDocumentListIcon className="h-8 w-8 mx-auto mb-2 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Activity Logs</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
