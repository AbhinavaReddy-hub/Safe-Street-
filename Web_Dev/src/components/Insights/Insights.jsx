import React from 'react'
import { motion } from 'framer-motion'
import { useCollapsed } from '../../context/collapse'
function Insights() {
    const {collapsed,setCollapsed} = useCollapsed();
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
        <div >
          <h3 className='font-serif'>Welcome {"Ozair"}</h3>
        </div>
      </motion.div>
  )
}

export default Insights