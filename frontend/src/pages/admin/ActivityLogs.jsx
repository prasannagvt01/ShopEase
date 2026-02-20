import { useState, useEffect } from 'react';
import {
    ClipboardDocumentListIcon,
    FunnelIcon,
    MagnifyingGlassIcon,
    ClockIcon,
    UserCircleIcon,
    TagIcon,
    ArchiveBoxIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const ENTITY_ICONS = {
    PRODUCT: ArchiveBoxIcon,
    ORDER: ShoppingBagIcon,
    COUPON: TagIcon,
    USER: UserCircleIcon
};

export default function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getActivityLogs();
            setLogs(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch activity logs');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'ALL' || log.entityType === filterType;
        return matchesSearch && matchesFilter;
    });

    if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Admin Activity Logs</h1>
                    <p className="text-gray-500 dark:text-gray-400">Complete audit trail of all administrative actions</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative">
                        <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-white w-full md:w-64"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl px-3 py-2">
                        <FunnelIcon className="h-4 w-4 text-gray-400" />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent border-none text-sm focus:ring-0 dark:text-white"
                        >
                            <option value="ALL">All Entities</option>
                            <option value="PRODUCT">Products</option>
                            <option value="ORDER">Orders</option>
                            <option value="COUPON">Coupons</option>
                            <option value="USER">Users</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase text-gray-500 font-bold">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Admin</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4">Description</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-gray-700">
                            {filteredLogs.length > 0 ? filteredLogs.map((log) => {
                                const Icon = ENTITY_ICONS[log.entityType] || ClipboardDocumentListIcon;
                                return (
                                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                                <ClockIcon className="h-3.5 w-3.5" />
                                                {new Date(log.timestamp).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                                                    {log.adminName?.[0]}
                                                </div>
                                                <span className="text-sm font-medium dark:text-white">{log.adminName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded text-[10px] font-bold uppercase">
                                                {log.action.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                                <Icon className="h-4 w-4 text-gray-400" />
                                                {log.entityType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm dark:text-gray-300 line-clamp-1">{log.description}</p>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center">
                                        <ClipboardDocumentListIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-500">No activity logs found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
