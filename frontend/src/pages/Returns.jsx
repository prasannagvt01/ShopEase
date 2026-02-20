import { ArrowPathIcon, CheckBadgeIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';

export default function Returns() {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Returns & Refunds
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We want you to love what you ordered. But if something's not right, let us know.
                </p>
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative">
                {/* Connector Line (Desktop) */}
                <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border dark:border-gray-800">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ArrowPathIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">1. Request Return</h3>
                    <p className="text-sm text-gray-500">
                        Go to My Orders &gt; Return Item within 30 days of delivery.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border dark:border-gray-800">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckBadgeIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">2. Quality Check</h3>
                    <p className="text-sm text-gray-500">
                        Our agent will check the item quality at the time of pickup.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl text-center border dark:border-gray-800">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CurrencyRupeeIcon className="h-8 w-8 text-primary-600" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">3. Instant Refund</h3>
                    <p className="text-sm text-gray-500">
                        Refund is initiated immediately to your source account.
                    </p>
                </div>
            </div>

            {/* Policy Content */}
            <div className="space-y-8">
                <div className="card">
                    <h2 className="text-xl font-bold mb-4">30-Day Return Policy</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        You can return products purchased from ShopEase within 30 days of receipt.
                        To be eligible for a return, your item must be unused and in the same condition that you received it.
                        It must also be in the original packaging with all tags intact.
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                        <li>Clothing must be unworn and unwashed.</li>
                        <li>Electronics must have all seals intact if unopened.</li>
                        <li>Beauty products cannot be returned if opened.</li>
                    </ul>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Non-Returnable Items</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Certain types of items cannot be returned for hygiene or safety reasons:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                        <li>Perishable goods (food, flowers)</li>
                        <li>Personal hygiene products</li>
                        <li>Gift cards</li>
                        <li>Downloadable software products</li>
                    </ul>
                </div>

                <div className="card">
                    <h2 className="text-xl font-bold mb-4">Refund Process</h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        Once your return is received and inspected, we will send you an email to notify you that we have received your returned item.
                        We will also notify you of the approval or rejection of your refund.
                        <br /><br />
                        If approved, your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within 5-7 business days.
                    </p>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-gray-500">
                    Have more questions? <a href="/contact" className="text-primary-600 hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
}
