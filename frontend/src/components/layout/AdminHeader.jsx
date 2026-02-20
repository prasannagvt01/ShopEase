import { useState, useEffect, Fragment } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import {
    SunIcon,
    MoonIcon,
    ArrowRightOnRectangleIcon,
    UserIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/authStore';

export default function AdminHeader() {
    const [isDark, setIsDark] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/admin" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/25">
                            <span className="text-white font-bold text-xl">A</span>
                        </div>
                        <span className="text-xl font-display font-bold text-gray-900 dark:text-white">
                            ShopEase Admin
                        </span>
                    </Link>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-2">
                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDark(!isDark)}
                            className="p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 
                        hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200"
                            aria-label="Toggle theme"
                        >
                            {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
                        </button>

                        {/* Admin Profile/Logout */}
                        <Menu as="div" className="relative">
                            <Menu.Button className="flex items-center gap-2 p-2 text-gray-600 dark:text-gray-300 
                                     hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
                                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg 
                              flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                    {user?.firstName?.[0] || 'A'}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{user?.firstName} (Admin)</span>
                                <ChevronDownIcon className="h-4 w-4 hidden sm:block" />
                            </Menu.Button>

                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-150"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl 
                                      shadow-soft-lg border border-gray-100 dark:border-gray-700 
                                      py-2 focus:outline-none">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {user?.firstName} {user?.lastName}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    <Menu.Item>
                                        {({ active }) => (
                                            <Link
                                                to="/"
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm ${active ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                                                    } text-gray-700 dark:text-gray-300`}
                                            >
                                                <ArrowRightOnRectangleIcon className="h-4 w-4 rotate-180" />
                                                Back to Store
                                            </Link>
                                        )}
                                    </Menu.Item>

                                    <div className="my-2 border-t border-gray-100 dark:border-gray-700" />

                                    <Menu.Item>
                                        {({ active }) => (
                                            <button
                                                onClick={handleLogout}
                                                className={`flex items-center gap-3 px-4 py-2.5 text-sm w-full ${active ? 'bg-red-50 dark:bg-red-900/20' : ''
                                                    } text-red-600 dark:text-red-400`}
                                            >
                                                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                                                Logout
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </div>
            </div>
        </header>
    );
}
