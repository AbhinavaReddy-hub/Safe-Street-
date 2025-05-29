import { MapPin, ArrowRight, CircleCheck, AlertCircle, Clock, ChevronRight, Users, MessageSquare, CheckCircle, Eye, Send, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCollapsed } from '../../context/collapse';

const API_BASE_URL = 'http://localhost:3000/api/completed';

const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
        case 'high':
            return { bg: 'bg-rose-100', text: 'text-rose-700', icon: 'text-rose-500' };
        case 'medium':
            return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'text-amber-500' };
        case 'low':
            return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-500' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-500' };
    }
};

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'analyzed':
            return { bg: 'bg-amber-100', text: 'text-amber-700' };
        case 'assigned':
            return { bg: 'bg-blue-100', text: 'text-blue-700' };
        case 'completed':
            return { bg: 'bg-green-100', text: 'text-green-700' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-700' };
    }
};

const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const openInMaps = (coordinates) => {
    // coordinates in API are [longitude, latitude]
    const [lng, lat] = coordinates;
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
};

export default function CompletedReports() {
    const { collapsed } = useCollapsed();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const fetchReports = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_BASE_URL}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiData = await response.json();
            console.log(apiData.data);

            setReports(apiData.data);
        } catch (err) {
            console.error('Error fetching reports:', err);
            setError(`Failed to load reports: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);
    const CompletedReportCard = ({ report }) => {
        // Access the reportId object which contains the actual report data
        const reportData = report.reportId;
        const workerData = report.workerId;

        const severityColors = getSeverityColor(reportData.severity);
        const statusColors = getStatusColor(report.status);

        // Calculate completion time
        const calculateCompletionTime = () => {
            const assignedDate = new Date(report.assignedAt);
            const completedDate = new Date(report.completedAt);
            const timeDiff = completedDate - assignedDate;
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        };

        return (
            <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-60 h-48 md:h-auto relative">
                        <img
                            src={reportData.imageUrls?.[0] || '/api/placeholder/300/200'}
                            alt={reportData.damageType || 'Road damage'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = '/api/placeholder/300/200';
                            }}
                        />
                        <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
                            {reportData.severity} Severity
                        </div>
                        <div className="absolute top-3 right-3 bg-green-100 text-green-700 px-2 py-1 text-xs font-medium rounded-full">
                            <CheckCircle size={12} className="inline mr-1" />
                            Completed
                        </div>
                    </div>

                    <div className="flex-1 p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 capitalize">
                                    {reportData.damageType || 'Road Damage'}
                                </h3>
                                <div className="flex items-center mt-1 text-sm text-gray-600">
                                    <MapPin size={14} className="mr-1 text-gray-400" />
                                    {reportData.location?.locationName || 'Unknown Location'}
                                </div>
                                <div className="flex items-center mt-1 text-sm text-green-600">
                                    <Users size={14} className="mr-1" />
                                    Completed by: {workerData?.name || workerData?.email || 'Unknown Worker'}
                                </div>
                                <div className={`inline-flex items-center mt-2 px-2 py-1 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
                                    <CheckCircle size={12} className="mr-1" />
                                    {report.status}
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <span className="text-xs text-gray-500">Confidence Score</span>
                                    <p className="text-sm font-medium">{(reportData.confidenceScore * 100).toFixed(1)}%</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Priority Score</span>
                                    <p className="text-sm font-medium">{reportData.priorityScore?.toFixed(1) || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-3">
                                <div>
                                    <span className="text-xs text-gray-500">Traffic Score</span>
                                    <p className="text-sm font-medium">{reportData.trafficCongestionScore?.toFixed(1) || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500">Completion Time</span>
                                    <p className="text-sm font-medium text-green-600">{calculateCompletionTime()}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <span className="text-xs text-gray-500">Case ID</span>
                                    <p className="text-sm font-medium text-gray-600">{report.caseId?.slice(-8) || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <div className="flex flex-col space-y-1">
                                <div className="flex items-center text-xs text-gray-500">
                                    <Clock size={14} className="mr-1" />
                                    Reported: {formatDate(reportData.createdAt)}
                                </div>
                                <div className="flex items-center text-xs text-gray-500">
                                    <Users size={14} className="mr-1" />
                                    Assigned: {formatDate(report.assignedAt)}
                                </div>
                                <div className="flex items-center text-xs text-green-600">
                                    <CheckCircle size={14} className="mr-1" />
                                    Completed: {formatDate(report.completedAt)}
                                </div>
                            </div>

                            <div className="flex space-x-2">
                                <button
                                    className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                                    onClick={() => openInMaps(reportData.location.coordinates)}
                                >
                                    <MapPin size={14} className="text-gray-600" />
                                    <span className="text-xs font-medium ml-1">View Map</span>
                                </button>


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };
    const totalReports = Object.values(reports).flat().length;

    if (loading) {
        return (
            <motion.div
                initial={{ marginLeft: "21%" }}
                animate={{ marginLeft: collapsed ? "4rem" : "21%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-gray-50 min-h-screen flex items-center justify-center"
                style={{
                    width: collapsed ? "calc(100vw - 4rem - 3%)" : "calc(100vw - 21% - 3%)",
                    paddingRight: "1rem",
                }}
            >
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                    <p className="text-lg text-gray-600">Loading reports...</p>
                </div>
            </motion.div>
        );
    }
    return (
        <motion.div
            initial={{ marginLeft: "21%" }}
            animate={{ marginLeft: collapsed ? "4rem" : "21%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="bg-gray-50 min-h-screen"
            style={{
                width: collapsed ? "calc(100vw - 4rem - 3%)" : "calc(100vw - 21% - 3%)",
                paddingRight: "1rem",
            }}
        >
            {/* Header */}

            <div className="bg-white px-6 py-6 shadow-sm sticky top-0 z-10 border-b border-gray-200">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Completed Reports</h1>
                            <div className="flex items-center mt-2">
                                <AlertCircle size={16} className="text-amber-700" />
                                <span className="text-gray-600 ml-2">
                                    {totalReports} total reports
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => fetchReports(selectedFilter)}
                            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <RefreshCw size={16} className="mr-2" />
                            Refresh
                        </button>
                    </div>



                    {error && (
                        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                </div>
            </div>

            {/* Reports List */}
            <div className="container mx-auto px-4 py-6 max-w-6xl">
                {reports.length === 0 ? (
                    <div className="text-center py-12">
                        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No Completed reports found
                        </h3>
                        <p className="text-gray-500">
                            'Completed reports will appear here'
                        </p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report._id}>
                            <CompletedReportCard report={report} />
                        </div>
                    ))
                )}
            </div>

        </motion.div>
    )
}
