import { useState, useEffect } from 'react';
import {
    CurrencyRupeeIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    XCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminTransactions() {
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        success: 0,
        failed: 0,
        refunded: 0
    });
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const fetchTransactions = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getPayments({
                page,
                size: 20,
                sort: 'createdAt,desc'
            });
            const data = response.data.data.content || [];
            setTransactions(data);
            setTotalPages(response.data.data.totalPages || 0);

            // Simple stats from current page for demonstration (ideally from a real stats endpoint)
            setStats({
                total: data.reduce((acc, curr) => acc + curr.amount, 0),
                success: data.filter(t => t.status === 'SUCCESS').length,
                failed: data.filter(t => t.status === 'FAILED').length,
                refunded: data.filter(t => t.status === 'REFUNDED').length,
            });
        } catch (error) {
            console.error('Failed to fetch transactions:', error);
            toast.error('Failed to load transaction data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'SUCCESS': return 'text-green-600 bg-green-50';
            case 'FAILED': return 'text-red-600 bg-red-50';
            case 'REFUNDED': return 'text-orange-600 bg-orange-50';
            case 'PROCESSING': return 'text-blue-600 bg-blue-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const filteredTransactions = transactions.filter(t =>
        (t.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.orderId?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (statusFilter === 'ALL' || t.status === statusFilter)
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Transactions
                </h1>
                <button
                    onClick={fetchTransactions}
                    className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                    title="Refresh"
                >
                    <ArrowPathIcon className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="card border-l-4 border-primary-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Volume (Page)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{stats.total.toFixed(2)}</p>
                </div>
                <div className="card border-l-4 border-green-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Successful</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.success}</p>
                </div>
                <div className="card border-l-4 border-red-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Failed</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.failed}</p>
                </div>
                <div className="card border-l-4 border-orange-500">
                    <p className="text-sm text-gray-500 uppercase font-semibold">Refunded</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.refunded}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Transaction ID or Order ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="input-field w-40"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                        <option value="REFUNDED">Refunded</option>
                        <option value="PROCESSING">Processing</option>
                    </select>
                </div>
            </div>

            {isLoading && transactions.length === 0 ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
                                <tr>
                                    <th className="px-6 py-4">Transaction ID</th>
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-700">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                                            {tx.transactionId || '---'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-primary-600">
                                            #{tx.orderId?.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">
                                            ₹{tx.amount.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                            {tx.method}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(tx.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${getStatusColor(tx.status)}`}>
                                                {tx.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="px-4 py-2 border rounded-lg disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
