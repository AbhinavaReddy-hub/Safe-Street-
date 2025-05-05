import React, { useState } from 'react';
import { motion, scale } from 'framer-motion';
import { TbLayoutSidebarRightCollapse, TbLayoutSidebarRightExpand } from "react-icons/tb";
import { FaRegCircleUser } from "react-icons/fa6";
import { IoLogOutSharp } from "react-icons/io5";

const nav = ['Home', 'User Reports', 'Team Analytics', 'Insights'];

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState('');

  const sidebarVariants = {
    open: { width: '17%' },
    collapsed: { width: '5%' },
  };

  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: collapsed ? '0%' : '17%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="h-screen bg-amber-700/[20%] rounded-r-4xl "
    >
      <div className="p-4 h-screen">


        {!collapsed ? (
          <motion.div
            className='h-[100%] overflow-hidden flex flex-col'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2,ease:'easeInOut' }}
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
                    <h3 className="font-serif text-2xl">Ozair</h3>
                    <p className="text-gray-600 text-base">Narayanguda Authority</p>
                  </div>
                </div>
              </div>


              <div className="flex flex-col gap-2 items-center">
                {nav.map((val, id) => (
                  <motion.div
                    key={id}
                    whileHover={{ scale: 1.05 }}
                    animate={activeId == val ? { scale: 1.05 } : {}}
                    className={`px-4 py-2 font-medium rounded-lg ${val!=activeId && " hover:bg-gray-100"}  cursor-pointer ${activeId == '' && val == 'Home' ? "bg-amber-800 text-white" : activeId == val ? "bg-amber-800 text-white" : ""}`}

                    onClick={() => setActiveId(val)}
                  >
                    {val}
                  </motion.div>
                ))}
              </div>
              <motion.div 
              whileHover={{backgroundColor:'#f3f4f6', borderRadius:'10px'}}
              className='mt-3 w-fit flex flex-row items-center self-center cursor-pointer gap-3 px-4 py-1 rounded-lg'>
                <IoLogOutSharp className='text-2xl rotate-180' />
                <button className='border-none text-[14px] font-medium' style={{all:'unset'}}>LogOut</button>
              </motion.div>
            </div>
          </motion.div>

        ) :
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ scale: 0 }}
            transition={{ delay: 1, ease: "easeInOut" }}

          >
            <TbLayoutSidebarRightCollapse
              className="text-3xl cursor-pointer mb-4"
              onClick={() => setCollapsed(!collapsed)}
            />
          </motion.div>
        }
      </div>
    </motion.div>
  );
}

export default Sidebar;
