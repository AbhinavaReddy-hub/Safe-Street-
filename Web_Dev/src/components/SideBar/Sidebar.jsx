import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { motion, scale } from 'framer-motion';
import { TbLayoutSidebarRightCollapse, TbLayoutSidebarRightExpand } from "react-icons/tb";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoLogOutSharp } from "react-icons/io5";
import { useCollapsed } from '../../context/collapse';

const nav = ['Home', 'Analyzed Reports','Assigned Reports', 'Completed Reports', 'Team Analytics', 'Insights'];

function Sidebar() {
  const { collapsed, setCollapsed } = useCollapsed();
  const location = useLocation();
  const locationMap = {
    "/": "Home",
    "/analyzedreports": "Analyzed Reports",
    "/assignedreports": "Assigned Reports",
     "/completedreports": "Completed Reports",
    "/analytics": "Team Analytics",
    "/insights": "Insights",
  }
  const [activeId, setActiveId] = useState(locationMap[location.pathname]);
  useEffect(() => {
    setActiveId(() => (locationMap[location.pathname]))
  }, [location.pathname])



  return (
    <motion.div
      animate={{ width: collapsed ? '4rem' : '17%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className={`fixed h-screen ${!collapsed && "bg-amber-700/[20%]"} rounded-r-4xl`}
    >
      <div className="p-4 h-screen">


        {!collapsed ? (
          <motion.div
            className='h-[100%] overflow-hidden flex flex-col'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, ease: 'easeInOut' }}
          >
            <motion.div
            >
              <TbLayoutSidebarRightExpand
                className="text-3xl cursor-pointer mb-4"
                onClick={() => setCollapsed(!collapsed)}
              />

            </motion.div>
            <div className='h-[100%] flex flex-col justify-around'>

              <div>
                <div className="flex justify-center">
                  <h2 className="text-2xl font-serif">Street Lens</h2>
                </div>

                <div className="mt-6 flex flex-col items-center gap-4">
                  <FaRegCircleUser className="text-6xl" />
                  <div className="flex flex-col items-center">
                    <h3 className="font-serif text-2xl">{localStorage.getItem('email')??'Authority'}</h3>
                    <p className="text-gray-600 text-base"> Authority</p>
                  </div>
                </div>
              </div>


              <div className="flex flex-col gap-2 items-center">
                {nav.map((val, id) => {
                  const routeMap = {
                    "Home": "/",
                    "Analyzed Reports": "/analyzedreports",
                    "Assigned Reports": "/assignedreports",
                    "Completed Reports": "/completedreports",
                    "Team Analytics": "/analytics",
                    "Insights": "/insights",
                  };
                  return (
                    <Link
                      to={routeMap[val]}
                      key={id}
                      onClick={() => setActiveId(val)}
                      className="w-full flex justify-center"
                    >
                      <motion.div
                        key={id}
                        whileHover={{ scale: 1.05 }}
                        animate={activeId == val ? { scale: 1.05 } : {}}
                        className={`px-4 py-2 font-medium rounded-lg ${val != activeId ? "hover:bg-gray-100" : ""}  cursor-pointer ${activeId == val ? "bg-amber-800 text-white" : ""}`}
                        onClick={() => setActiveId(val)}
                      >
                        {val}
                      </motion.div>
                    </Link>
                  )
                })}
              </div>
              <motion.div
                whileHover={{ backgroundColor: '#f3f4f6', borderRadius: '10px' }}
                className='mt-3 w-fit flex flex-row items-center self-center cursor-pointer gap-3 px-4 py-1 rounded-lg'>
                <IoLogOutSharp className='text-2xl rotate-180' />
                <button className='border-none text-[14px] font-medium' style={{ all: 'unset' }}>LogOut</button>
              </motion.div>
            </div>
          </motion.div>

        ) :
          <motion.div
            className='w-[100px]'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ scale: 0 }}
            transition={{ delay: 1, ease: "easeInOut" }}

          >
            <TbLayoutSidebarRightCollapse
              className="text-3xl cursor-pointer block"
              onClick={() => setCollapsed(!collapsed)}
            />
          </motion.div>
        }
      </div>
    </motion.div>
  );
}

export default Sidebar;
