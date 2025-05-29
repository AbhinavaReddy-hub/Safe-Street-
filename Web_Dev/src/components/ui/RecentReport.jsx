import React, { useState } from 'react';
import RecentCard from './recentCard';
import { Link } from 'react-router-dom';
import { ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';

function RecentReport({ reports = [] }) {
  const [viewClicked, setViewClicked] = useState(false);

  
  const transformReportData = (report) => {
    
    const generateTitle = (type, severity) => {
      const typeMap = {
        'patch': 'Road Patch',
        'pothole': 'Pothole',
        'crack': 'Road Crack',
        'surface': 'Surface Damage'
      };
      
      const severityMap = {
        'high': 'Critical',
        'medium': 'Moderate',
        'low': 'Minor'
      };

      const damageType = typeMap[type?.toLowerCase()] || 'Road Damage';
      const severityLevel = severityMap[severity?.toLowerCase()] || severity;
      
      return `${severityLevel} ${damageType} Detected`;
    };


    const generateMessage = (report) => {
      const { damageResult, location, trafficCongestionScore } = report;
      const severity = damageResult?.severity || 'unknown';
      const type = damageResult?.damageType || 'damage';
      const locationName = location?.split(',')[0] || 'Unknown location'; 
      
      const messages = {
        high: `${type} requiring immediate attention identified at ${locationName}. High priority repair needed.`,
        medium: `${type} detected at ${locationName}. Repair recommended within 7-14 days.`,
        low: `Minor ${type} observed at ${locationName}. Monitor for changes.`
      };
      
      return messages[severity] || `Road damage detected at ${locationName}. Assessment required.`;
    };

    return {
      id: report.id,
      src: report.image || report.allImages?.[0] || "https://via.placeholder.com/400x300?text=No+Image",
      type: "damage_alert",
      title: generateTitle(report.type, report.severity),
      message: generateMessage(report),
      severity: report.severity?.toLowerCase() || 'medium',
      severity_score: report.priorityScore || 0,
      location: report.location || 'Unknown Location',
      timestamp: report.date ? new Date(report.date).toISOString() : new Date().toISOString(),
      read: Math.random() > 0.5, 
      confidenceScore: report.priorityScore || 0,
      trafficScore: report.trafficCongestionScore || 0,
      caseId: report.caseId || '',
      coordinates: report.coordinates || []
    };
  };

  const reportsToShow = reports.length > 0 
    ? reports.map(transformReportData) 
    : [];

  return (
    <div className='w-full flex flex-col gap-2 shadow-md px-3 py-3 overflow-clip bg-white rounded-xl'>
      <div className='flex flex-wrap justify-between'>
        <div className='font-serif text-2xl'>Recent Reports</div>
        <Link to="/analyzedreports">
          <div className='flex gap-1 items-center cursor-pointer hover:text-blue-600 transition-colors'>
            <h3>View All</h3>
            <ChevronsRight size={24} color="#6b7280" />
          </div>
        </Link>
      </div>
      
      {reportsToShow.length === 0 ? (
        <div className='flex items-center justify-center py-8'>
          <div className='text-center text-gray-500'>
            <div className='text-lg mb-2'>No recent reports available</div>
            <div className='text-sm'>Reports will appear here once data is loaded</div>
          </div>
        </div>
      ) : (
        <div className='flex gap-8 py-2 px-2 overflow-x-auto'>
          {reportsToShow.map((report, index) => (
            <motion.div
              key={report.id}
              whileHover={{ scale: 1.03 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
              className="flex-shrink-0" // Prevent cards from shrinking
            >
              <RecentCard prediction={report} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentReport;