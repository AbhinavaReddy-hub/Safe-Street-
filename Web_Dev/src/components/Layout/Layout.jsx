import React from 'react';
import Sidebar from '../SideBar/Sidebar';
import { Bell } from 'lucide-react';

function Layout({children}) {
  return (
    <div className='h-screen w-screen flex relative'>
      <div className="fixed right-6 top-6 cursor-pointer">
      <Bell size={26} color="black" className='font-bold' />
      </div>
      <Sidebar/>
      {children}
    </div>
  )
}

export default Layout;