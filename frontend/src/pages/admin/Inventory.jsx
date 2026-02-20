import { useState, useEffect } from 'react';
import {
    ArchiveBoxIcon,
    ExclamationTriangleIcon,
    MapPinIcon,
    PlusIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminInventory() {
    const [activeTab, setActiveTab] = useState('stock'); // 'stock', 'warehouses', 'alerts'
    const [inventory, setInventory] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [productsRes, warehousesRes, alertsRes] = await Promise.all([
                adminAPI.getProducts({ page: 0, size: 100 }),
                adminAPI.getWarehouses(),
                adminAPI.getLowStockAlerts()
            ]);
            setInventory(productsRes.data.data.content || []);
            setWarehouses(warehousesRes.data.data || []);
            setAlerts(alertsRes.data.data || []);
        } catch (error) {
            console.error('Failed to fetch inventory data:', error);
            toast.error('Failed to load inventory data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUpdateStock = async (productId, currentStock) => {
        const change = window.prompt(`Enter stock change for this product (current: ${currentStock}):`, '0');
        if (!change || isNaN(change)) return;

        try {
            await adminAPI.updateStock(productId, parseInt(change), 'MANUAL_UPDATE', 'Direct admin update');
            toast.success('Stock updated successfully');
            fetchData();
        } catch (error) {
            console.error('Failed to update stock:', error);
            toast.error('Failed to update stock');
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                    <ArchiveBoxIcon className="h-8 w-8 text-primary-600" />
                    Inventory Management
                </h1>
                <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
                    <ArrowPathIcon className="h-5 w-5" />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b dark:border-gray-700 mb-8 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('stock')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'stock'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Product Stock
                </button>
                <button
                    onClick={() => setActiveTab('alerts')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'alerts'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Low Stock Alerts
                    {alerts.length > 0 && (
                        <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full ring-2 ring-white dark:ring-gray-800">
                            {alerts.length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('warehouses')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 whitespace-nowrap ${activeTab === 'warehouses'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                        }`}
                >
                    Warehouses
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : (
                <div className="animate-fade-in">
                    {activeTab === 'stock' && (
                        <div className="card overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr className="text-left text-gray-500 dark:text-gray-400 text-sm">
                                            <th className="px-6 py-3">Product</th>
                                            <th className="px-6 py-3">Warehouse</th>
                                            <th className="px-6 py-3">Current Stock</th>
                                            <th className="px-6 py-3">Threshold</th>
                                            <th className="px-6 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y dark:divide-gray-700">
                                        {inventory.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                            <img src={item.images?.[0] || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                                            <p className="text-xs text-gray-500">{item.brand}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                    Primary
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`font-semibold ${item.stockQuantity <= item.lowStockThreshold ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                        {item.stockQuantity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {item.lowStockThreshold}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleUpdateStock(item.id, item.stockQuantity)}
                                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                    >
                                                        Update Stock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'alerts' && (
                        <div className="space-y-4">
                            {alerts.length === 0 ? (
                                <div className="card p-12 text-center text-gray-500">
                                    <ArchiveBoxIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>All products are sufficiently stocked.</p>
                                </div>
                            ) : (
                                alerts.map((item) => (
                                    <div key={item.id} className="card p-4 flex items-center justify-between border-l-4 border-l-red-500">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                                                <p className="text-sm text-red-600 font-medium">
                                                    Only {item.stockQuantity} left (Threshold: {item.lowStockThreshold})
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleUpdateStock(item.id, item.stockQuantity)}
                                            className="btn-secondary text-sm"
                                        >
                                            Restock
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'warehouses' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {warehouses.length === 0 ? (
                                <div className="col-span-full card p-12 text-center text-gray-500">
                                    <MapPinIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                    <p>No warehouses configured.</p>
                                    <button className="btn-primary mt-4 flex items-center gap-2 mx-auto">
                                        <PlusIcon className="h-5 w-5" />
                                        Add Warehouse
                                    </button>
                                </div>
                            ) : (
                                warehouses.map((w) => (
                                    <div key={w.id} className="card p-6 border-t-4 border-t-primary-600">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg">{w.name}</h3>
                                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${w.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {w.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                            <p className="flex items-center gap-2">
                                                <MapPinIcon className="h-4 w-4" />
                                                {w.address}, {w.city}
                                            </p>
                                            <p className="flex items-center gap-2 font-mono">
                                                📞 {w.contactNumber}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                            {warehouses.length > 0 && (
                                <button className="card p-6 border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center text-gray-500 hover:border-primary-600 hover:text-primary-600 transition-all">
                                    <PlusIcon className="h-8 w-8 mb-2" />
                                    <span>Add Warehouse</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
