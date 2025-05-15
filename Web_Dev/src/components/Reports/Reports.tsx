import { MapPin, ArrowRight, CircleCheck, AlertCircle, Clock, ChevronRight, Users } from 'lucide-react';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCollapsed } from '../../context/collapse';

const mockAreas = {
  "Narayanaguda": [
    {
      id: 1,
      image: 'https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w',
      type: 'Pothole',
      severity: 'High',
      status: 'Pending',
      location: '123 Main St, Downtown',
      coordinates: { lat: 40.7128, lng: -74.0060 },
      date: '2024-02-20',
      description: 'Large pothole causing traffic disruption. Immediate attention required.',
    },
    {
      id: 2,
      image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
      type: 'Road Crack',
      severity: 'Medium',
      status: 'In Progress',
      location: '456 Oak Ave, Downtown',
      coordinates: { lat: 40.7142, lng: -74.0064 },
      date: '2024-02-19',
      description: 'Longitudinal crack extending across lane. Requires sealing.',
    }
  ],
  "Dilshukhnagar": [
    {
      id: 3,
      image: 'data:image/jpeg;base64,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',
      type: 'Surface Damage',
      severity: 'Low',
      status: 'Pending',
      location: '789 Pine Rd, Suburban Area',
      coordinates: { lat: 40.7135, lng: -74.0057 },
      date: '2024-02-18',
      description: 'Surface wear showing signs of deterioration. Schedule maintenance.',
    }
  ],
  "Miyapur": [
    {
      id: 4,
      image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
      type: 'Road Depression',
      severity: 'High',
      status: 'Pending',
      location: '321 Factory Rd, Industrial Zone',
      coordinates: { lat: 40.7140, lng: -74.0070 },
      date: '2024-02-17',
      description: 'Significant road depression affecting heavy vehicle traffic.',
    }
  ]
};

const getSeverityColor = (severity) => {
  switch (severity.toLowerCase()) {
    case 'high':
      return {
        bg: 'bg-rose-100', 
        text: 'text-rose-700',
        icon: 'text-rose-500'
      };
    case 'medium':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: 'text-amber-500'
      };
    case 'low':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        icon: 'text-emerald-500'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: 'text-gray-500'
      };
  }
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200'
      };
    case 'in progress':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200'
      };
    case 'completed':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200'
      };
  }
};

const getStatusIcon = (status) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return <Clock size={14} className="mr-1" />;
    case 'in progress':
      return <Users size={14} className="mr-1" />;
    case 'completed':
      return <CircleCheck size={14} className="mr-1" />;
    default:
      return null;
  }
};

const openInMaps = (coordinates) => {
  window.open(`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`, '_blank');
};

export default function Reports() {
  const { collapsed, setCollapsed } = useCollapsed();
  const [filter, setFilter] = useState("all");
  const totalReports = Object.values(mockAreas).flat().length;
  
  const DamageCard = ({ damage }) => {
    const severityColors = getSeverityColor(damage.severity);
    const statusColors = getStatusColor(damage.status);
    const statusIcon = getStatusIcon(damage.status);
    
    return (
      <div className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-100">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-60 h-48 md:h-auto relative">
            <img
              src={damage.image}
              alt={damage.type}
              className="w-full h-full object-cover"
            />
            <div className={`absolute top-3 left-3 ${severityColors.bg} ${severityColors.text} px-2 py-1 text-xs font-medium rounded-full`}>
              {damage.severity} Priority
            </div>
          </div>
          
          <div className="flex-1 p-5">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center">
                  <h3 className="text-lg font-bold text-gray-900">{damage.type}</h3>
                  <div className={`ml-3 flex items-center ${statusColors.text} ${statusColors.bg} px-2 py-1 text-xs rounded-full`}>
                    {statusIcon}
                    {damage.status}
                  </div>
                </div>
                
                <div className="flex items-center mt-1 text-sm text-gray-600">
                  <MapPin size={14} className="mr-1 text-gray-400" />
                  {damage.location}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-700 mb-3">
                {damage.description}
              </p>
            </div>

            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs text-gray-500">
                <Clock size={14} className="mr-1" />
                Reported: {damage.date}
              </div>
              
              <div className="flex space-x-2">
                <button
                  className="flex items-center justify-center px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors"
                  onClick={() => openInMaps(damage.coordinates)}
                >
                  <MapPin size={14} className="text-gray-600" />
                  <span className="text-xs font-medium ml-1">View on Map</span>
                </button>
                
                <button
                  className="flex items-center justify-center px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
                  onClick={() => console.log('Assign', damage.id)}
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
                  {totalReports} reports across {Object.keys(mockAreas).length} areas
                </span>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Reports
              </button>
              <button
                onClick={() => setFilter("high")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "high" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                High Priority
              </button>
              <button
                onClick={() => setFilter("pending")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === "pending" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {Object.entries(mockAreas).map(([area, damages]) => {
          // Filter damages based on selected filter
          const filteredDamages = filter === "all" 
            ? damages 
            : filter === "high" 
              ? damages.filter(d => d.severity.toLowerCase() === "high")
              : damages.filter(d => d.status.toLowerCase() === "pending");
              
          if (filteredDamages.length === 0) return null;
          
          return (
            <div key={area} className="mb-8">
              <div className="flex items-center mb-4 bg-white p-3 rounded-lg shadow-sm border-l-4 border-amber-600">
                <MapPin size={20} className="text-amber-700" />
                <h2 className="text-xl font-semibold text-gray-800 ml-2">{area}</h2>
                <span className="text-sm text-gray-500 ml-2">({filteredDamages.length} reports)</span>
                <ChevronRight size={20} className="ml-auto text-gray-400" />
              </div>
              
              {filteredDamages.map((damage) => (
                <DamageCard key={damage.id} damage={damage} />
              ))}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}