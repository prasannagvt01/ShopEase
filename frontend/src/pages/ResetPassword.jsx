import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LockClosedIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const { resetPassword, isLoading } = useAuthStore();

    useEffect(() => {
        if (!token) {
            toast.error('Invalid or missing reset token');
            navigate('/login');
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const result = await resetPassword({ token, newPassword: password });
        if (result.success) {
            setIsSuccess(true);
            toast.success('Password reset successful');
            setTimeout(() => navigate('/login'), 5000);
        } else {
            toast.error(result.error || 'Failed to reset password');
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-6 text-green-600">
                        <CheckCircleIcon className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Password reset successful</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Your password has been successfully reset. You will be redirected to login in a few seconds.
                    </p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Go to login now
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Reset password</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Please enter your new password below.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="********"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <LockClosedIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                placeholder="********"
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
                    >
                        {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Set new password'}
                    </button>
                </form>
            </div>
        </div>
    );
}
