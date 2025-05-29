import { MapPin, ArrowRight, CircleCheck, AlertCircle, Clock, ChevronRight, Users, MessageSquare, CheckCircle, Eye, Send, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCollapsed } from '../../context/collapse';

const API_BASE_URL = 'http://localhost:3000/api';

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

const filterOptions = [
  {
    value: 'priority',
    label: 'Priority Based',
    endpoint: `${API_BASE_URL}/reports`,
    icon: '📊'
  },
  {
    value: 'high',
    label: 'High Severity',
    endpoint: `${API_BASE_URL}/admin/reports/severity/high?page=1&limit=10`,
    icon: '🔴'
  },
  {
    value: 'medium',
    label: 'Medium Severity',
    endpoint: `${API_BASE_URL}/admin/reports/severity/medium?page=1&limit=10`,
    icon: '🟡'
  },
  {
    value: 'low',
    label: 'Low Severity',
    endpoint: `${API_BASE_URL}/admin/reports/severity/low?page=1&limit=10`,
    icon: '🟢'
  }
];

export default function AnalyzedReports() {
  const { collapsed } = useCollapsed();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  // Add selectedFilter state
  const [selectedFilter, setSelectedFilter] = useState('priority');


  // Fixed fetchReports function with filterType parameter
  const fetchReports = async (filterType = 'priority') => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const selectedOption = filterOptions.find(option => option.value === filterType);
      const endpoint = selectedOption ? selectedOption.endpoint : `${API_BASE_URL}`;

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      setReports(apiData.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(`Failed to load reports: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/users/workers`, {
        headers: {
          'authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();
      setWorkers(apiData.data);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError(`Failed to load workers: ${err.message}`);
    } finally {
      setLoadingWorkers(false);
    }
  };
  const assignReport = async (batchId, workerId) => {
    try {
      const token = localStorage.getItem('token');

      // Make API call to assign the report to worker
      const response = await fetch(`${API_BASE_URL}/admin/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          batchId: batchId,
          workerId: workerId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Show success message modal
      setShowMessageModal(true);
      setNewMessage(`Report batch successfully assigned to worker!`);

      // Refresh reports after successful assignment
      fetchReports(selectedFilter);

    } catch (err) {
      console.error('Error assigning report:', err);
      setError('Failed to assign report');
    }

    setShowAssignModal(false);
    setSelectedReport(null);
    setSelectedTeam(''); // You might want to rename this to selectedWorker
  };

  useEffect(() => {
    fetchReports('priority');
  }, []);

  // Fixed handleFilterChange function
  const handleFilterChange = (filterType) => {
    setSelectedFilter(filterType);
    fetchReports(filterType);
  };

  // Fixed ReportFilter component
  const ReportFilter = () => {
    return (
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Filter Reports</h3>
            <p className="text-sm text-gray-600">Sort reports by priority or severity level</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`
                  flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${selectedFilter === option.value
                    ? 'bg-blue-100 text-blue-800 border-2 border-blue-200 shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-2 border-transparent hover:bg-gray-100 hover:border-gray-200'
                  }
                `}
              >
                <span className="mr-2">{option.icon}</span>
                {option.label}
                {selectedFilter === option.value && (
                  <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter indicator */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Currently showing: <span className="font-medium text-gray-700">
                {filterOptions.find(option => option.value === selectedFilter)?.label}
              </span>
            </span>
            {loading && (
              <div className="flex items-center text-xs text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };





  const AnalyzedReportCard = ({ report }) => {
    const severityColors = getSeverityColor(report.damageResult.severity);
    const statusColors = getStatusColor('analyzed');

    // Get the most recent report for primary display
    const primaryReport = report.reports[0];
    const hasMultipleReports = report.reportCount > 1;

    // Calculate average traffic congestion score
    const avgTrafficScore = report.reports.reduce((sum, r) => sum + (r.trafficCongestionScore || 0), 0) / report.reports.length;

    return (
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-60 h-48 md:h-auto relative">
            <img
              src={primaryReport.imageUrls?.[0] || '/api/placeholder/300/200'}
              alt={report.damageResult.damageType || 'Road damage'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/300/200';
              }}
            />
            <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.damageResult.severity} Severity
            </div>
            {hasMultipleReports && (
              <div className="absolute top-3 right-3 bg-blue-100 text-blue-700 px-2 py-1 text-xs font-medium rounded-full">
                {report.reportCount} Reports
              </div>
            )}
            <div className={`absolute bottom-3 left-3 ${statusColors.bg} ${statusColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              <AlertCircle size={12} className="inline mr-1" />
              Analyzed
            </div>
          </div>

          <div className="flex-1 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {report.damageResult.damageType || 'Road Damage'}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  {primaryReport.location?.locationName || 'Unknown Location'}
                </div>
                <div className="flex items-center mt-1 text-sm text-blue-600">
                  <Users size={14} className="mr-1" />
                  {hasMultipleReports ? `${report.reportCount} similar reports` : 'Single report'}
                </div>
                {hasMultipleReports && (
                  <div className="flex items-center mt-1 text-xs text-gray-500">
                    <CircleCheck size={12} className="mr-1" />
                    Clustered in H3 cell: {report.h3Cell?.slice(-6)}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-xs text-gray-500">Confidence Score</span>
                  <p className="text-sm font-medium">{(report.damageResult.confidenceScore * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Priority Score</span>
                  <p className="text-sm font-medium">{report.damageResult.priorityScore?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-xs text-gray-500">Severity Weight</span>
                  <p className="text-sm font-medium">{report.damageResult.severityWeight || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Avg Traffic Score</span>
                  <p className="text-sm font-medium">{avgTrafficScore.toFixed(1)}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="text-xs text-gray-500">Batch ID</span>
                  <p className="text-sm font-medium text-gray-600">{report.batchId?.slice(-8) || 'N/A'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex flex-col space-y-1">
                <div className="flex items-center text-xs text-gray-500">
                  <Clock size={14} className="mr-1" />
                  First Report: {formatDate(report.reports[report.reports.length - 1].createdAt)}
                </div>
                {hasMultipleReports && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={14} className="mr-1" />
                    Latest Report: {formatDate(primaryReport.createdAt)}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  onClick={() => openInMaps(primaryReport.location.coordinates)}
                >
                  <MapPin size={14} className="text-gray-600" />
                  <span className="text-xs font-medium ml-1">View Map</span>
                </button>

                {/* {hasMultipleReports && (
                  <button
                    className="flex items-center justify-center px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg transition-colors"
                    onClick={() => {
                      // Handle view all reports in cluster
                      console.log('View all reports in cluster:', report._id);
                    }}
                  >
                    <Eye size={14} />
                    <span className="text-xs font-medium ml-1">View All</span>
                  </button>
                )} */}

                <button
                  className="flex items-center justify-center px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowAssignModal(true);
                    fetchWorkers(); // Fetch workers when opening modal
                  }}
                >
                  <Users size={14} />
                  <span className="text-xs font-medium ml-1">Assign Worker</span>
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
              <h1 className="text-2xl font-bold text-gray-900">Analyzed Reports</h1>
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

          {/* Add ReportFilter here */}
          <ReportFilter />

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
              No analyzed reports found
            </h3>
            <p className="text-gray-500">
              New reports will appear here for assignment
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report._id}>
              <AnalyzedReportCard report={report} />
            </div>
          ))
        )}
      </div>

      {/* Assign Team Modal */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-bold mb-4">Assign Worker to Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedReport.damageResult?.damageType || selectedReport.damageType} at {selectedReport.reports?.[0]?.location?.locationName || selectedReport.location?.locationName}
            </p>

            {loadingWorkers ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="animate-spin mr-2" size={16} />
                <span className="text-sm text-gray-600">Loading workers...</span>
              </div>
            ) : (
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              >
                <option value="">Select a worker...</option>
                {workers.map(worker => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.email})
                  </option>
                ))}
              </select>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedReport(null);
                  setSelectedTeam('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => assignReport(selectedReport.batchId, selectedTeam)}
                disabled={!selectedTeam || loadingWorkers}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Success Message Modal after the Assign Team Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-bold mb-2 text-gray-900">Assignment Successful</h3>
              <p className="text-sm text-gray-600 mb-6">{newMessage}</p>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setNewMessage('');
                }}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}



    </motion.div>
  );
}