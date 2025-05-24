import React, { useState } from 'react';
import RecentCard from './recentCard';
import { Link } from 'react-router-dom';
import { ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';

const recentDamageReports = [
  {
    id: "notif_001",
    src: "https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.jpg?s=612x612&w=0&k=20&c=C6x40SIitvOnljrXy-1AZcZ16k3rhmkqnXEDVz-ifZ0=",
    type: "damage_alert",
    title: "Pothole Cluster Detected",
    message: "Multiple deep potholes identified near Jubilee Hills Road No. 45. Risk to two-wheelers.",
    severity: "high",
    severity_score: 8.9,
    location: "Jubilee Hills, Hyderabad",
    timestamp: "2025-05-12T07:30:00Z",
    read: false
  },
  {
    id: "notif_002",
    src: "https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.jpg?s=612x612&w=0&k=20&c=C6x40SIitvOnljrXy-1AZcZ16k3rhmkqnXEDVz-ifZ0=",
    type: "damage_alert",
    title: "Surface Damage Reported",
    message: "Widespread surface wear observed near Madhapur main road. Repair recommended within 7 days.",
    severity: "medium",
    severity_score: 6.3,
    location: "Madhapur, Hyderabad",
    timestamp: "2025-05-11T14:15:00Z",
    read: true
  },
  {
    id: "notif_003",
    src: "https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg",
    type: "damage_alert",
    title: "High-Severity Damage Alert",
    message: "Multiple severe cracks detected on Highway 22. Immediate attention required.",
    severity: "high",
    severity_score: 9.2,
    location: "Highway 22",
    timestamp: "2025-04-03T08:00:00Z",
    read: true
  },
];

function RecentReport() {
  const [viewClicked, setViewClicked] = useState(false);
  return (
    <div className='w-full flex flex-col gap-2 shadow-md px-3 py-3 overflow-clip'>
      <div className='flex flex-wrap justify-between'>
        <div className='font-serif text-2xl'>RecentReport</div>
        <Link to="/reports">
          <div className='flex gap-1 items-center cursor-pointer'>
            <h3>View All</h3>
            <ChevronsRight size={24} color="#6b7280" />
          </div>
        </Link>
      </div>
      <div className='flex gap-8 py-2 px-2 overflow-x-hidden'>
        {
          recentDamageReports.map((val, index) => (
            <motion.div
              key={val.id}
              whileHover={{scale:1.03}}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.2 }}
            >
              <RecentCard prediction={val} />
            </motion.div>
          ))
        }
      </div>
    </div>
  );
}

export default RecentReport;
