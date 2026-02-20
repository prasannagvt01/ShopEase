import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { EnvelopeIcon, ArrowLeftIcon, KeyIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { toast } from 'react-hot-toast';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('EMAIL'); // EMAIL, OTP
    const [timer, setTimer] = useState(120); // 2 minutes
    const [canResend, setCanResend] = useState(false);

    const navigate = useNavigate();
    const { forgotPassword, verifyOtp, isLoading } = useAuthStore();

    useEffect(() => {
        let interval;
        if (step === 'OTP' && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        const result = await forgotPassword(email);
        if (result.success) {
            setStep('OTP');
            setTimer(120);
            setCanResend(false);
            toast.success('OTP sent to your email');
        } else {
            toast.error(result.error || 'Failed to send OTP');
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        const result = await verifyOtp(email, otp);
        if (result.success) {
            toast.success('OTP verified successfully');
            navigate(`/reset-password?token=${result.resetToken}`);
        } else {
            toast.error(result.error || 'Invalid OTP');
        }
    };

    const handleResendOtp = async () => {
        setCanResend(false);
        setTimer(120); // Reset timer
        const result = await forgotPassword(email);
        if (result.success) {
            toast.success('OTP resent successfully');
        } else {
            setCanResend(true); // Allow retry if failed
            toast.error(result.error || 'Failed to resend OTP');
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block mb-6">
                        <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">
                            Sales Savvy
                        </span>
                    </Link>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {step === 'EMAIL' ? 'Forgot password?' : 'Enter OTP'}
                    </h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        {step === 'EMAIL'
                            ? "No worries, we'll send you an OTP to reset it."
                            : `We've sent a 6-digit OTP to ${email}`
                        }
                    </p>
                </div>

                {step === 'EMAIL' ? (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Enter 6-digit OTP
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="otp"
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all tracking-widest text-center text-lg"
                                    placeholder="000000"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all"
                        >
                            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Verify OTP'}
                        </button>

                        <div className="text-center">
                            {canResend ? (
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={isLoading}
                                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                                >
                                    <ArrowPathIcon className="h-4 w-4" />
                                    Resend OTP
                                </button>
                            ) : (
                                <p className="text-sm text-gray-500">
                                    Resend OTP in <span className="font-mono font-medium text-gray-700 dark:text-gray-300">{formatTime(timer)}</span>
                                </p>
                            )}
                        </div>
                    </form>
                )}

                <div className="mt-8 text-center border-t dark:border-gray-700 pt-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 transition-colors"
                    >
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
}
