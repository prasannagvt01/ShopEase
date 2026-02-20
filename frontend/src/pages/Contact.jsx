import { useState } from 'react';
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success('Message sent successfully! We will get back to you soon.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-fade-in">
            <div className="text-center mb-16">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Contact Us
                </h1>
                <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    We'd love to hear from you. Please send us a message or get in touch using our contact details.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Contact Info */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="card border-l-4 border-primary-600">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <PhoneIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Call Us</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">Mon-Fri from 9am to 6pm</p>
                                <a href="tel:+918001234567" className="text-lg font-medium hover:text-primary-600">
                                    +91 1800-123-4567
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="card border-l-4 border-primary-600">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <EnvelopeIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email Us</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-2">We reply within 24 hours</p>
                                <a href="mailto:support@shopease.com" className="text-lg font-medium hover:text-primary-600">
                                    support@shopease.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="card border-l-4 border-primary-600">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                <MapPinIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Visit Us</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    ShopEase HQ<br />
                                    123 Commerce Avenue, Tech Park<br />
                                    Bangalore, Karnataka 560100
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                    <div className="card">
                        <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="input-field"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Subject</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="input-field"
                                    placeholder="Order Inquiry / Feedback"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea
                                    required
                                    rows="6"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="input-field resize-none"
                                    placeholder="How can we help you?"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="btn-primary min-w-[150px]"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
