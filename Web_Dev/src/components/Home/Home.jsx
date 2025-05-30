import React from 'react'
import Layout from '../Layout/Layout';
import Chart from '../ui/Chart';
import LeaderBoard from '../ui/LeaderBoard';
import { useCollapsed } from '../../context/collapse';
import { motion } from 'framer-motion';
import RecentReport from '../ui/RecentReport';
import { useState } from 'react';
import { useEffect } from 'react';

const data = [
  { city: 'Hyderabad', reports: 120 },
  { city: 'Delhi', reports: 98 },
  { city: 'Mumbai', reports: 140 },
  { city: 'Chennai', reports: 80 },
  { city: 'Bangalore', reports: 160 },
  { city: 'Kolkata', reports: 110 },
];

function Home() {
  const {collapsed, setCollapsed} = useCollapsed();
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    pendingTasks: 0,
    resolvedCases: 0,

  });
 const [countData,setCountData]=useState({});
  const transformReportsData = (apiReports) => {
    const transformedReports = [];
    
    apiReports.forEach((report) => {
      report.reports.forEach((individualReport, index) => {
        transformedReports.push({
          id: individualReport._id,
          image: individualReport.imageUrls?.[0] || '',
          type: report.damageResult?.damageType || 'Unknown',
          severity: report.damageResult?.severity || 'Unknown',
          status: report.status || 'Pending',
          location: individualReport.location?.locationName || 'Unknown Location',
          date: new Date(individualReport.createdAt).toISOString().split('T')[0], 
          priorityScore: report.damageResult?.priorityScore || 0,
          confidenceScore: report.damageResult?.confidenceScore || 0,
          trafficCongestionScore: individualReport.trafficCongestionScore || 0,
          coordinates: individualReport.location?.coordinates || [],
          caseId: individualReport.caseId,
          allImages: individualReport.imageUrls || []
        });
      });
    });

    return transformedReports;
  };

  const fetchReports = async (filterType = 'priority') => {
    try {
      setError(null);
      setLoading(true);
      const token = localStorage.getItem('token');
      const endpoint1 = `http://localhost:3000/api/admin/reports/severity/high?page=1&limit=3`;
      const endpoint2=`http://localhost:3000/api/admin/reports`;
      const endpoint3= "http://localhost:3000/api/assigned";
      const endpoint4 ="http://localhost:3000/api/completed";
      const response1 = await fetch(endpoint1, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const response2 = await fetch(endpoint2, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
       const response3 = await fetch(endpoint3, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
       const response4 = await fetch(endpoint4, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response1.ok) {
        throw new Error(`HTTP error! status: ${response1.status}`);
      }
      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response2.status}`);
      }
      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response3.status}`);
      }
      if (!response2.ok) {
        throw new Error(`HTTP error! status: ${response4.status}`);
      }

      const apiData = await response1.json();
      const countData = await response2.json();
      const assigned = await response3.json();
      const completed = await response4.json()
      const transformedReports = transformReportsData(apiData.data);
      
      setReports(transformedReports.slice(0, 3));

      const totalReports = countData.total || 0;

      setUserStats({
        totalReports: totalReports,
        pendingTasks: assigned.count||0,
        resolvedCases: completed.count || 0,
      });

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

  // Capitalize first letter of strings
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  console.log('Reports:', reports);

  return (
    <motion.div
      initial={{marginLeft:"21%"}}
      animate={{ marginLeft: collapsed ? "4rem" : "21%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}     
      className="mt-5 flex flex-col gap-7 h-screen"
      style={{
        width: collapsed ? "calc(100vw - 4rem - 3%)" : "calc(100vw - 21% - 3%)",
        paddingRight: "1rem",
      }}
    >
      <div className='flex flex-col gap-2'>
        <h3 className='font-serif text-2xl font-medium'>Welcome {localStorage.getItem('email')}</h3>
        <div className="w-2xl px-5 py-6 bg-white mt-[1px] mx-2 rounded-xl shadow-md">
          <div className="flex justify-between">
            <div className="flex-1 flex flex-col items-center bg-amber-700/[20%] p-4 rounded-2xl mr-2">
              <p className="text-2xl font-bold">{userStats.totalReports}</p>
              <p className="text-[16px] text-blue-700 text-center mt-1">Total Reports</p>
            </div>
            <div className="flex-1 flex flex-col items-center bg-amber-700/[20%] p-4 rounded-2xl mx-2">
              <p className="text-2xl font-bold">{userStats.pendingTasks}</p>
              <p className="text-[16px] text-yellow-700 text-center mt-1">Pending Tasks</p>
            </div>
            <div className="flex-1 flex flex-col items-center bg-amber-700/[20%] p-4 rounded-2xl ml-2">
              <p className="text-2xl font-bold">{userStats.resolvedCases}</p>
              <p className="text-[16px] text-green-700 text-center mt-1">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      <div className=''>
        <Chart/>
        {/* <LeaderBoard/> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-lg">Loading recent reports...</div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center p-8">
          <div className="text-red-600">{error}</div>
        </div>
      ) : (
        <RecentReport reports={reports} />
      )}
    </motion.div>
  )
}

export default Home;