import { MapPin, ArrowRight, CircleCheck, AlertCircle, Clock, ChevronRight, Users, MessageSquare, CheckCircle, Eye, Send } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCollapsed } from '../../context/collapse';

const mockReports = {
  analyzed: [
    {
      id: 1,
      image: 'https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w',
      type: 'Pothole',
      severity: 'High',
      status: 'Analyzed',
      location: '123 Main St, Narayanaguda',
      area: 'Narayanaguda',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      date: '2024-02-20',
      description: 'Large pothole causing traffic disruption. Immediate attention required.',
    },
    {
      id: 2,
      image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
      type: 'Road Crack',
      severity: 'Medium',
      status: 'Analyzed',
      location: '456 Oak Ave, Dilshukhnagar',
      area: 'Dilshukhnagar',
      coordinates: { lat: 40.7142, lng: -74.0064 },
      date: '2024-02-19',
      description: 'Longitudinal crack extending across lane. Requires sealing.',
    }
  ],
  ongoing: [
    {
      id: 3,
      image: 'https://img.freepik.com/premium-photo/cracks-splits-road-surface-damaged-asphalt-roads_387624-349.jpg',
      type: 'Surface Damage',
      severity: 'Low',
      status: 'In Progress',
      location: '789 Pine Rd, Miyapur',
      area: 'Miyapur',
      assignedTeam: 'Team Alpha',
      coordinates: { lat: 40.7135, lng: -74.0057 },
      date: '2024-02-18',
      assignedDate: '2024-02-19',
      description: 'Surface wear showing signs of deterioration. Schedule maintenance.',
      messages: [
        { id: 1, sender: 'Admin', text: 'Please prioritize this repair', timestamp: '2024-02-19 10:30' },
        { id: 2, sender: 'Team Alpha', text: 'Materials ordered, starting work tomorrow', timestamp: '2024-02-19 14:20' }
      ]
    }
  ],
  completed: [
    {
      id: 4,
      image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
      type: 'Road Depression',
      severity: 'High',
      status: 'Completed',
      location: '321 Factory Rd, Miyapur',
      area: 'Miyapur',
      assignedTeam: 'Team Beta',
      coordinates: { lat: 40.7140, lng: -74.0070 },
      date: '2024-02-15',
      assignedDate: '2024-02-16',
      completedDate: '2024-02-18',
      description: 'Significant road depression affecting heavy vehicle traffic. Successfully repaired.',
    }
  ]
};

const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
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

const openInMaps = (coordinates) => {
  window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
};

export default function Reports() {
  const { collapsed } = useCollapsed();
  const [activeTab, setActiveTab] = useState('analyzed');
  const [reports, setReports] = useState(mockReports);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const teams = ['Team Alpha', 'Team Beta', 'Team Gamma', 'Team Delta'];

  const assignReport = (reportId, team) => {
    const reportToAssign = reports.analyzed.find(r => r.id === reportId);
    if (reportToAssign) {
      const updatedReport = { 
        ...reportToAssign, 
        status: 'In Progress', 
        assignedTeam: team,
        assignedDate: new Date().toISOString().split('T')[0],
        messages: []
      };
      
      setReports({
        ...reports,
        analyzed: reports.analyzed.filter(r => r.id !== reportId),
        ongoing: [...reports.ongoing, updatedReport]
      });
    }
    setShowAssignModal(false);
    setSelectedReport(null);
    setSelectedTeam('');
  };

  const sendMessage = (reportId, message) => {
    const updatedOngoing = reports.ongoing.map(report => {
      if (report.id === reportId) {
        const newMsg = {
          id: Date.now(),
          sender: 'Admin',
          text: message,
          timestamp: new Date().toLocaleString()
        };
        return {
          ...report,
          messages: [...(report.messages || []), newMsg]
        };
      }
      return report;
    });
    
    setReports({
      ...reports,
      ongoing: updatedOngoing
    });
    setNewMessage('');
    setShowMessageModal(false);
  };

  const AnalyzedReportCard = ({ report }) => {
    const severityColors = getSeverityColor(report.severity);
    
    return (
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-60 h-48 md:h-auto relative">
            <img src={report.image} alt={report.type} className="w-full h-full object-cover" />
            <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.severity} Priority
            </div>
          </div>
          
          <div className="flex-1 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{report.type}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  {report.location}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-3">{report.description}</p>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                Reported: {report.date}
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  onClick={() => openInMaps(report.coordinates)}
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

  const OngoingReportCard = ({ report }) => {
    const severityColors = getSeverityColor(report.severity);
    
    return (
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-60 h-48 md:h-auto relative">
            <img src={report.image} alt={report.type} className="w-full h-full object-cover" />
            <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {report.severity} Priority
            </div>
          </div>
          
          <div className="flex-1 p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{report.type}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  {report.location}
                </div>
                <div className="flex items-center mt-1 text-sm text-blue-600">
                  <Users size={14} className="mr-1" />
                  Assigned to: {report.assignedTeam}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-3">{report.description}</p>
              
              {report.messages && report.messages.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Messages:</h4>
                  <div className="space-y-1">
                    {report.messages.slice(-2).map(msg => (
                      <div key={msg.id} className="text-xs">
                        <span className="font-medium text-gray-700">{msg.sender}:</span>
                        <span className="text-gray-600 ml-1">{msg.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                Assigned: {report.assignedDate}
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  onClick={() => openInMaps(report.coordinates)}
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
            <img src={report.image} alt={report.type} className="w-full h-full object-cover" />
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
                <h3 className="text-lg font-bold text-gray-900">{report.type}</h3>
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  {report.location}
                </div>
                <div className="flex items-center mt-1 text-sm text-green-600">
                  <Users size={14} className="mr-1" />
                  Completed by: {report.assignedTeam}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-3">{report.description}</p>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                Completed: {report.completedDate}
              </div>
              
              <button
                className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                onClick={() => openInMaps(report.coordinates)}
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

  const currentReports = reports[activeTab] || [];

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
                  {Object.values(reports).flat().length} total reports
                </span>
              </div>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-6 flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('analyzed')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analyzed' 
                  ? 'bg-white text-amber-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye size={16} className="inline mr-2" />
              Analyzed Reports ({reports.analyzed.length})
            </button>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'ongoing' 
                  ? 'bg-white text-blue-800 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock size={16} className="inline mr-2" />
              Ongoing Reports ({reports.ongoing.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'completed' 
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
            <div key={report.id}>
              {activeTab === 'analyzed' && <AnalyzedReportCard report={report} />}
              {activeTab === 'ongoing' && <OngoingReportCard report={report} />}
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
              {selectedReport.type} at {selectedReport.location}
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
                onClick={() => assignReport(selectedReport.id, selectedTeam)}
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
              {selectedReport.type} at {selectedReport.location}
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
                onClick={() => sendMessage(selectedReport.id, newMessage)}
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