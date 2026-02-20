import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const faqs = [
    {
        category: 'Orders & Tracking',
        questions: [
            {
                q: 'How do I track my order?',
                a: 'Once your order ships, you will receive a confirmation email with a tracking number. You can also track your order status in the "My Orders" section of your account.',
            },
            {
                q: 'Can I change or cancel my order?',
                a: 'You can cancel your order within 1 hour of placing it. After that, we process orders quickly, but you may be able to return items after delivery.',
            },
            {
                q: 'My order is missing an item.',
                a: 'We apologize for the inconvenience. Please contact our support team immediately with your order number, and we will resolve the issue.',
            },
        ],
    },
    {
        category: 'Shipping & Delivery',
        questions: [
            {
                q: 'How long does shipping take?',
                a: 'Standard shipping typically takes 3-5 business days. Express shipping options (1-2 days) are available at checkout.',
            },
            {
                q: 'Do you ship internationally?',
                a: 'Yes, we ship to select international destinations. Shipping costs and delivery times vary by location.',
            },
        ],
    },
    {
        category: 'Returns & Refunds',
        questions: [
            {
                q: 'What is your return policy?',
                a: 'We accept returns within 30 days of purchase. Items must be unused and in original packaging. Please verify our Return Policy page for more details.',
            },
            {
                q: 'When will I get my refund?',
                a: 'Refunds are processed within 5-7 business days after we receive your returned item. The funds will be returned to your original payment method.',
            },
        ],
    },
    {
        category: 'Payments',
        questions: [
            {
                q: 'What payment methods do you accept?',
                a: 'We accept major credit/debit cards (Visa, MasterCard, Amex), UPI, Net Banking, and Cash on Delivery (COD) for eligible orders.',
            },
        ],
    },
];

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                Frequently Asked Questions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-12">
                Find answers to common questions about your shopping experience.
            </p>

            <div className="space-y-8">
                {faqs.map((category, catIndex) => (
                    <div key={catIndex}>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
                            {category.category}
                        </h2>
                        <div className="space-y-4">
                            {category.questions.map((faq, index) => {
                                const uniqueIndex = `${catIndex}-${index}`;
                                const isOpen = openIndex === uniqueIndex;

                                return (
                                    <div
                                        key={index}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleFAQ(uniqueIndex)}
                                            className="w-full flex justify-between items-center p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                                        >
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {faq.q}
                                            </span>
                                            {isOpen ? (
                                                <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                                            )}
                                        </button>
                                        {isOpen && (
                                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 animate-fade-in">
                                                {faq.a}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 text-center bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Still have questions?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Can't find the answer you're looking for? Please chat to our friendly team.
                </p>
                <a
                    href="/contact"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                >
                    Get in touch
                </a>
            </div>
        </div>
    );
}
