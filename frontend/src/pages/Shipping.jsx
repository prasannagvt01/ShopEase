import { TruckIcon, GlobeAmericasIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function Shipping() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Shipping & Delivery
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We are committed to delivering your order accurately, in good condition, and always on time.
                </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="card text-center p-6">
                    <TruckIcon className="h-10 w-10 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Free Shipping</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        On all orders above ₹500 across India.
                    </p>
                </div>
                <div className="card text-center p-6">
                    <ClockIcon className="h-10 w-10 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Fast Delivery</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Most orders are delivered within 3-5 business days.
                    </p>
                </div>
                <div className="card text-center p-6">
                    <GlobeAmericasIcon className="h-10 w-10 mx-auto text-primary-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nationwide</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        We ship to over 25,000+ pin codes across the country.
                    </p>
                </div>
            </div>

            {/* Delivery Timelines */}
            <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    Delivery Timelines
                </h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Region
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Standard Shipping
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Express Shipping
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    Metro Cities
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    2-3 Days
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    1-2 Days
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    Tier 2 Cities
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    3-5 Days
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    2-3 Days
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    Rest of India
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    5-7 Days
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    3-5 Days
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Policy Details */}
            <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-xl font-bold mb-4">Order Processing</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We process orders within 24 hours of confirmation. Orders placed on weekends or holidays will be processed on the next business day. You will receive an email/SMS notification once your order is shipped.
                </p>

                <h3 className="text-xl font-bold mb-4">Tracking Your Order</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Once shipped, you will receive a tracking ID to monitor your package's journey. You can also track your order in the "My Orders" section of our website.
                </p>

                <h3 className="text-xl font-bold mb-4">International Shipping</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    For international orders, shipping charges are calculated based on weight and destination at checkout. Customs duties and taxes, if applicable, are vital to be paid by the customer upon delivery.
                </p>
            </div>
        </div>
    );
}
