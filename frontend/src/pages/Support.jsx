import { useState } from 'react';
import {
    QuestionMarkCircleIcon,
    ChatBubbleBottomCenterTextIcon,
    EnvelopeIcon,
    PhoneIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const FAQS = [
    {
        question: 'How do I track my order?',
        answer: 'You can track your order by going to "My Orders" in your profile section. Each order has a status timeline that updates as your package moves through our system.'
    },
    {
        question: 'What is your return policy?',
        answer: 'We offer a 7-day easy return policy for most items. Items must be in their original packaging and condition. You can initiate a return through the order details page.'
    },
    {
        question: 'How can I apply a coupon?',
        answer: 'You can apply a coupon code on the Cart page or during the Checkout process in the Order Summary section.'
    },
    {
        question: 'Do you offer international shipping?',
        answer: 'Currently, we only ship within India. Stay tuned as we plan to expand our services internationally in the future.'
    }
];

export default function Support() {
    const [openFaq, setOpenFaq] = useState(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Your message has been sent. We will get back to you soon!');
        setContactForm({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                    How can we help you?
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We're here to help you with any questions or concerns you may have about our products or services.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* FAQ Section */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <QuestionMarkCircleIcon className="h-7 w-7 text-primary-600" />
                        <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                    </div>
                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <div
                                key={index}
                                className="border dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    className="w-full flex items-center justify-between p-4 text-left font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <span>{faq.question}</span>
                                    {openFaq === index ? (
                                        <ChevronUpIcon className="h-5 w-5 text-primary-600" />
                                    ) : (
                                        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                    )}
                                </button>
                                {openFaq === index && (
                                    <div className="p-4 border-t dark:border-gray-700 text-gray-600 dark:text-gray-400 animate-slide-down">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 bg-primary-50 dark:bg-primary-900/10 rounded-2xl p-8 text-center border border-primary-100 dark:border-primary-900/20">
                        <h3 className="text-xl font-bold text-primary-900 dark:text-primary-100 mb-2">Still have questions?</h3>
                        <p className="text-primary-700 dark:text-primary-300 mb-6">
                            If you can't find what you're looking for, feel free to contact us.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <div className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
                                <EnvelopeIcon className="h-5 w-5" />
                                <span>support@salessavvy.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-primary-800 dark:text-primary-200">
                                <PhoneIcon className="h-5 w-5" />
                                <span>+91 1800 123 4567</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form Section */}
                <div className="card">
                    <div className="flex items-center gap-3 mb-6">
                        <ChatBubbleBottomCenterTextIcon className="h-7 w-7 text-primary-600" />
                        <h2 className="text-2xl font-bold">Contact Us</h2>
                    </div>
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Your Name</label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    className="input-field"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    className="input-field"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subject</label>
                            <input
                                type="text"
                                required
                                value={contactForm.subject}
                                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                                className="input-field"
                                placeholder="How can we help?"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Message</label>
                            <textarea
                                required
                                rows={5}
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                className="input-field"
                                placeholder="Type your message here..."
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full btn-primary py-3 text-lg font-semibold"
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
