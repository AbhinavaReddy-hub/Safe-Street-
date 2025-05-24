import React from 'react'
import Layout from '../Layout/Layout';
import Chart from '../ui/Chart';
import LeaderBoard from '../ui/LeaderBoard';
import { useCollapsed } from '../../context/collapse';
import { motion } from 'framer-motion';
import RecentReport from '../ui/RecentReport';


const data = [
  { city: 'Hyderabad', reports: 120 },
  { city: 'Delhi', reports: 98 },
  { city: 'Mumbai', reports: 140 },
  { city: 'Chennai', reports: 80 },
  { city: 'Bangalore', reports: 160 },
  { city: 'Kolkata', reports: 110 },
];

const mockUser = {
  name: 'John Doe',
  stats: {
    totalReports: 24,
    pendingTasks: 5,
    resolvedCases: 19,
  },
  recentReports: [
    {
      id: 1,
      image: 'https://images.squarespace-cdn.com/content/v1/573365789f726693272dc91a/1704992146415-CI272VYXPALWT52IGLUB/AdobeStock_201419293.jpeg?format=1500w',
      type: 'Pothole',
      severity: 'High',
      status: 'Pending',
      location: 'Miyapur, Hyderabad',
      date: '2024-02-20',
    },
    {
      id: 2,
      image: 'https://img.etimg.com/thumb/width-600,height-450,msid-96818695,imgsize-25308/uttarakhand-joshimath-malari-border-road-develops-cracks-due-to-land-subsidence.jpg',
      type: 'Crack',
      severity: 'Medium',
      status: 'In Progress',
      location: 'Narayanaguda',
      date: '2024-02-19',
    },
    {
      id: 3,
      image: 'https://media.istockphoto.com/id/183851840/photo/bad-repair-pothole-in-road-t-junction-suffers-frost-damage.jpg?s=612x612&w=0&k=20&c=C6x40SIitvOnljrXy-1AZcZ16k3rhmkqnXEDVz-ifZ0=',
      type: 'Surface Damage',
      severity: 'Low',
      status: 'Completed',
      location: 'Gachibowli',
      date: '2024-02-18',
    },
  ],
};

function Home() {
  const {collapsed,setCollapsed}=useCollapsed();
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
          <h3 className='font-serif text-2xl font-medium'>Welcome {"Ozair"}</h3>
          <div className="w-2xl px-5 py-6 bg-white mt-[1px] mx-2 rounded-xl shadow-md">
              <div className="flex justify-between">
                <div className="flex-1 flex flex-col items-center bg-amber-700/[20%] p-4 rounded-2xl mr-2">
                  <p className="text-2xl font-bold">{mockUser.stats.totalReports}</p>
                  <p className="text-[16px] text-blue-700 text-center mt-1">Total Reports</p>
                </div>
                <div className="flex-1 flex flex-col items-center bg-amber-700/[20%] p-4 rounded-2xl mx-2">
                  <p className="text-2xl font-bold">{mockUser.stats.pendingTasks}</p>
                  <p className="text-[16px] text-yellow-700 text-center mt-1">Pending Tasks</p>
                </div>
                <div className="flex-1 flex flex-col items-center bg-amber-700/[20%] p-4 rounded-2xl ml-2">
                  <p className="text-2xl font-bold">{mockUser.stats.resolvedCases}</p>
                  <p className="text-[16px] text-green-700 text-center mt-1">Resolved</p>
                </div>
              </div>
            </div>

        </div>
        <div className='flex gap-7'>

        <Chart/>
        <LeaderBoard/>
        </div>
        <RecentReport/>
      </motion.div>
  )
}

export default Home;