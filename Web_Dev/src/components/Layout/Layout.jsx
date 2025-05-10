import React from 'react';
import Sidebar from '../SideBar/Sidebar';

function Layout({children}) {
  return (
    <div className='h-screen w-screen flex'>
      <Sidebar/>
      {children}
    </div>
  )
}

export default Layout;