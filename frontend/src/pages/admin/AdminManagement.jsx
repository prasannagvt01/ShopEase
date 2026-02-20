import { useState, useEffect } from 'react';
import {
    UserPlusIcon,
    ShieldCheckIcon,
    EllipsisVerticalIcon,
    CheckCircleIcon,
    XCircleIcon,
    ArchiveBoxIcon,
    TagIcon,
    ShoppingBagIcon,
    UsersIcon,
    ChartBarIcon
} from '@heroicons/react/24/outline';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const PERMISSIONS = [
    { id: 'view_reports', name: 'View Reports', icon: ChartBarIcon },
    { id: 'manage_products', name: 'Manage Products', icon: ArchiveBoxIcon },
    { id: 'manage_orders', name: 'Manage Orders', icon: ShoppingBagIcon },
    { id: 'manage_coupons', name: 'Manage Coupons', icon: TagIcon },
    { id: 'manage_users', name: 'Manage Users', icon: UsersIcon },
];

export default function AdminManagement() {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAdmin, setSelectedAdmin] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchAdmins = async () => {
        setIsLoading(true);
        try {
            const res = await adminAPI.getAdminUsers();
            setAdmins(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch admin users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleUpdatePermissions = async (adminId, permissions) => {
        try {
            await adminAPI.updateAdminPermissions(adminId, permissions);
            toast.success('Permissions updated');
            fetchAdmins();
            setIsModalOpen(false);
        } catch (error) {
            toast.error('Failed to update permissions');
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">Admin Role Management</h1>
                    <p className="text-gray-500 dark:text-gray-400">Manage staff roles and granular permissions</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <UserPlusIcon className="h-5 w-5" />
                    Add Sub-Admin
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-700/50 text-left text-xs uppercase text-gray-500 dark:text-gray-400 font-bold">
                            <th className="px-6 py-4">Admin User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Permissions</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-700">
                        {admins.map((admin) => (
                            <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold">
                                            {admin.firstName[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm dark:text-white">{admin.firstName} {admin.lastName}</p>
                                            <p className="text-xs text-gray-500">{admin.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${admin.roles.includes('ADMIN') ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                                            admin.roles.includes('MANAGER') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30' :
                                                'bg-gray-100 text-gray-700 dark:bg-gray-700'
                                        }`}>
                                        {admin.roles.join(', ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {admin.permissions?.slice(0, 2).map(p => (
                                            <span key={p} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-600 dark:text-gray-300">
                                                {p.replace('_', ' ')}
                                            </span>
                                        ))}
                                        {(admin.permissions?.length > 2) && (
                                            <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] text-gray-400">
                                                +{admin.permissions.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1.5 text-xs font-medium ${admin.active ? 'text-green-600' : 'text-red-500'}`}>
                                        {admin.active ? <CheckCircleIcon className="h-4 w-4" /> : <XCircleIcon className="h-4 w-4" />}
                                        {admin.active ? 'Active' : 'Deactivated'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => {
                                            setSelectedAdmin(admin);
                                            setIsModalOpen(true);
                                        }}
                                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <EllipsisVerticalIcon className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Permissions Modal */}
            {isModalOpen && selectedAdmin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
                        <div className="p-6 border-b dark:border-gray-700">
                            <h2 className="text-xl font-bold dark:text-white">Admin Permissions</h2>
                            <p className="text-sm text-gray-500">Configure what {selectedAdmin.firstName} can access</p>
                        </div>
                        <div className="p-6 space-y-4">
                            {PERMISSIONS.map((perm) => (
                                <label key={perm.id} className="flex items-center justify-between p-3 rounded-xl border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 text-gray-500 group-hover:text-indigo-600 transition-colors">
                                            <perm.icon className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium text-sm dark:text-white">{perm.name}</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        checked={selectedAdmin.permissions?.includes(perm.id)}
                                        onChange={(e) => {
                                            const newPerms = e.target.checked
                                                ? [...(selectedAdmin.permissions || []), perm.id]
                                                : selectedAdmin.permissions.filter(p => p !== perm.id);
                                            setSelectedAdmin({ ...selectedAdmin, permissions: newPerms });
                                        }}
                                    />
                                </label>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdatePermissions(selectedAdmin.id, selectedAdmin.permissions)}
                                className="flex-1 btn-primary py-2 rounded-xl"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
