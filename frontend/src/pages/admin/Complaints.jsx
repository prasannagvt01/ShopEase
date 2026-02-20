import { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    ChatBubbleBottomCenterTextIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminComplaints() {
    const [complaints, setComplaints] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [resolutionNotes, setResolutionNotes] = useState('');

    const fetchComplaints = async () => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getComplaints({ page, size: 10 });
            setComplaints(response.data.data.content || []);
            setTotalPages(response.data.data.totalPages || 0);
        } catch (error) {
            console.error('Failed to fetch complaints:', error);
            toast.error('Failed to load complaints');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [page]);

    const handleUpdateStatus = async (id, status) => {
        try {
            await adminAPI.updateComplaintStatus(id, status, resolutionNotes);
            toast.success(`Complaint marked as ${status}`);
            setSelectedComplaint(null);
            setResolutionNotes('');
            fetchComplaints();
        } catch (error) {
            console.error('Failed to update complaint status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'RESOLVED': return 'bg-green-100 text-green-800';
            case 'CLOSED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesSearch = c.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.subject.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Customer Complaints
            </h1>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-grow">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email or subject..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="input-field md:w-48"
                >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner size="lg" />
                </div>
            ) : filteredComplaints.length === 0 ? (
                <div className="card text-center py-12 text-gray-500">
                    No complaints found based on your filters.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredComplaints.map((complaint) => (
                        <div key={complaint.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                        <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-gray-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                            {complaint.subject}
                                        </h3>
                                        <p className="text-sm text-gray-500">{complaint.userEmail}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(complaint.status)}`}>
                                    {complaint.status}
                                </span>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                {complaint.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <ClockIcon className="h-4 w-4" />
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => setSelectedComplaint(complaint)}
                                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                >
                                    Handle Complaint
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal for Handling Complaint */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="card w-full max-w-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold mb-4">Handle Complaint: {selectedComplaint.subject}</h2>
                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                <p className="text-sm font-semibold mb-1">Description:</p>
                                <p className="text-gray-700 dark:text-gray-300 italic">"{selectedComplaint.description}"</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 line-height-relaxed">Resolution/Internal Notes</label>
                                <textarea
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    className="input-field h-32"
                                    placeholder="Enter resolution steps or notes for this complaint..."
                                ></textarea>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-3 justify-end">
                            <button onClick={() => setSelectedComplaint(null)} className="px-4 py-2 text-gray-500 hover:text-gray-700">
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedComplaint.id, 'IN_PROGRESS')}
                                className="btn-secondary px-4 py-2"
                            >
                                Mark In Progress
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedComplaint.id, 'RESOLVED')}
                                className="btn-success px-4 py-2 flex items-center gap-2"
                            >
                                <CheckCircleIcon className="h-4 w-4" />
                                Mark Resolved
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
