import { MapPin, ArrowRight, CircleCheck, AlertCircle, Clock, ChevronRight, Users, MessageSquare, CheckCircle, Eye, Send, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCollapsed } from '../../context/collapse';

const API_BASE_URL = 'http://localhost:3000/api/reports';

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

export default function Reports() {
  const { collapsed } = useCollapsed();
  const [activeTab, setActiveTab] = useState('analyzed');
  const [reports, setReports] = useState({ analyzed: [], assigned: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const teams = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];

  // Fetch reports from API
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token'); // Get stored JWT
      const response = await fetch(`${API_BASE_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Replace with the actual token
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const apiData = await response.json();

      // Group reports by status
      const groupedReports = {
        analyzed: apiData.data?.filter(report => report.status === 'analyzed') || [],
        assigned: apiData.data?.filter(report => report.status === 'assigned') || [],
        completed: apiData.data?.filter(report => report.status === 'completed') || []
      };
      console.log(groupedReports);

      setReports(groupedReports);
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

  const assignReport = async (reportId, team) => {
    try {
      // Here you would make an API call to assign the report
      // For now, we'll update the local state
      const reportToAssign = reports.analyzed.find(r => r._id === reportId);
      if (reportToAssign) {
        const updatedReport = {
          ...reportToAssign,
          status: 'assigned',
          assignedTeam: team,
          assignedDate: new Date().toISOString(),
        };

        setReports({
          ...reports,
          analyzed: reports.analyzed.filter(r => r._id !== reportId),
          assigned: [...reports.assigned, updatedReport]
        });
      }
    } catch (err) {
      console.error('Error assigning report:', err);
      setError('Failed to assign report');
    }

    setShowAssignModal(false);
    setSelectedReport(null);
    setSelectedTeam('');
  };

  const sendMessage = (reportId, message) => {
    // This would typically make an API call to send the message
    // For now, we'll just close the modal
    console.log('Sending message to report:', reportId, message);
    setNewMessage('');
    setShowMessageModal(false);
  };

  const AnalyzedReportCard = ({ report }) => {
    const severityColors = getSeverityColor(report.damageResult.severity);
    const statusColors = getStatusColor(report.status);

    return (
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-60 h-48 md:h-auto relative">
            <img
              src={report.reports.imageUrls?.[0] || '/api/placeholder/300/200'}
              alt={report.damageResult.damageType || 'Road damage'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/300/200';
              }}
            />
            <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.damageResult.severity} Priority
            </div>
            <div className={`absolute top-3 right-3 ${statusColors.bg} ${statusColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.status}
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
                  {report.reports?.location?.locationName || 'Unknown Location'}
                </div>
                <div className="flex items-center mt-1 text-sm text-blue-600">
                  <Users size={14} className="mr-1" />
                  Reported by: {report.userId?.name || 'Anonymous'}
                </div>
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
              <p className="text-sm text-gray-700">{report.message || 'No additional details provided.'}</p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                Reported: {formatDate(report.createdAt)}
              </div>

              <div className="flex space-x-2">
                <button
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  onClick={() => openInMaps(report.location.coordinates)}
                >
                  <MapPin size={14} className="text-gray-600" />
                  <span className="text-xs font-medium ml-1">View Map</span>
                </button>

                <button
                  className="flex items-center justify-center px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowAssignModal(true);
                  }}
                >
                  <Users size={14} />
                  <span className="text-xs font-medium ml-1">Assign Team</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AssignedReportCard = ({ report }) => {
    const severityColors = getSeverityColor(report.severity);
    const statusColors = getStatusColor(report.status);

    return (
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-60 h-48 md:h-auto relative">
            <img
              src={report.imageUrls?.[0] || '/api/placeholder/300/200'}
              alt={report.damageType || 'Road damage'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/300/200';
              }}
            />
            <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.severity} Priority
            </div>
            <div className={`absolute top-3 right-3 ${statusColors.bg} ${statusColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.status}
            </div>
          </div>

          <div className="flex-1 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900 capitalize">
                  {report.damageType || 'Road Damage'}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  {report.location?.locationName || 'Unknown Location'}
                </div>
                <div className="flex items-center mt-1 text-sm text-blue-600">
                  <Users size={14} className="mr-1" />
                  Assigned to: {report.assignedTeam || 'Team not specified'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-xs text-gray-500">Confidence Score</span>
                  <p className="text-sm font-medium">{(report.confidenceScore * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Priority Score</span>
                  <p className="text-sm font-medium">{report.priorityScore?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{report.message || 'No additional details provided.'}</p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                Assigned: {formatDate(report.updatedAt)}
              </div>

              <div className="flex space-x-2">
                <button
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  onClick={() => openInMaps(report.location.coordinates)}
                >
                  <MapPin size={14} className="text-gray-600" />
                  <span className="text-xs font-medium ml-1">View Map</span>
                </button>

                <button
                  className="flex items-center justify-center px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg transition-colors"
                  onClick={() => {
                    setSelectedReport(report);
                    setShowMessageModal(true);
                  }}
                >
                  <MessageSquare size={14} />
                  <span className="text-xs font-medium ml-1">Send Message</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CompletedReportCard = ({ report }) => {
    const severityColors = getSeverityColor(report.severity);

    return (
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-60 h-48 md:h-auto relative">
            <img
              src={report.imageUrls?.[0] || '/api/placeholder/300/200'}
              alt={report.damageType || 'Road damage'}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/api/placeholder/300/200';
              }}
            />
            <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.severity} Priority
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
                  {report.damageType || 'Road Damage'}
                </h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  {report.location?.locationName || 'Unknown Location'}
                </div>
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <Users size={14} className="mr-1" />
                  Completed by: {report.assignedTeam || 'Team not specified'}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <span className="text-xs text-gray-500">Confidence Score</span>
                  <p className="text-sm font-medium">{(report.confidenceScore * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Priority Score</span>
                  <p className="text-sm font-medium">{report.priorityScore?.toFixed(1) || 'N/A'}</p>
                </div>
              </div>
              <p className="text-sm text-gray-700">{report.message || 'No additional details provided.'}</p>
            </div>

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                Completed: {formatDate(report.updatedAt)}
              </div>

              <button
                className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                onClick={() => openInMaps(report.location.coordinates)}
              >
                <MapPin size={14} className="text-gray-600" />
                <span className="text-xs font-medium ml-1">View Map</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const currentReports = reports[activeTab === 'ongoing' ? 'assigned' : activeTab] || [];
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
              <h1 className="text-2xl font-bold text-gray-900">Road Damage Reports</h1>
              <div className="flex items-center mt-2">
                <AlertCircle size={16} className="text-amber-700" />
                <span className="text-gray-600 ml-2">
                  {totalReports} total reports
                </span>
              </div>
            </div>
            <button
              onClick={fetchReports}
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

          {/* Tab Navigation */}
          <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('analyzed')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'analyzed'
                  ? 'bg-white text-amber-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Eye size={16} className="inline mr-2" />
              Analyzed Reports ({reports.analyzed.length})
            </button>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'ongoing'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <Clock size={16} className="inline mr-2" />
              Ongoing Reports ({reports.assigned.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'completed'
                  ? 'bg-white text-green-800 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              <CheckCircle size={16} className="inline mr-2" />
              Completed Reports ({reports.completed.length})
            </button>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {currentReports.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab} reports found
            </h3>
            <p className="text-gray-500">
              {activeTab === 'analyzed' && 'New reports will appear here for assignment'}
              {activeTab === 'ongoing' && 'Reports assigned to teams will appear here'}
              {activeTab === 'completed' && 'Completed reports will appear here'}
            </p>
          </div>
        ) : (
          currentReports.map((report) => (
            <div key={report._id}>
              {activeTab === 'analyzed' && <AnalyzedReportCard report={report} />}
              {activeTab === 'ongoing' && <AssignedReportCard report={report} />}
              {activeTab === 'completed' && <CompletedReportCard report={report} />}
            </div>
          ))
        )}
      </div>

      {/* Assign Team Modal */}
      {showAssignModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-bold mb-4">Assign Team to Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedReport.damageType} at {selectedReport.location?.locationName}
            </p>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
            >
              <option value="">Select a team...</option>
              {teams.map(team => (
                <option key={team} value={team}>{team}</option>
              ))}
            </select>
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
                onClick={() => assignReport(selectedReport._id, selectedTeam)}
                disabled={!selectedTeam}
                className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-bold mb-4">Send Message to {selectedReport.assignedTeam}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {selectedReport.damageType} at {selectedReport.location?.locationName}
            </p>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 h-24 resize-none"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedReport(null);
                  setNewMessage('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => sendMessage(selectedReport._id, newMessage)}
                disabled={!newMessage.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} className="inline mr-2" />
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}