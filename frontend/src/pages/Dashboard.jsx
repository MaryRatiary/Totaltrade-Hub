import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Calendar from './Calendar'


const Dashboard = () => {
  return (
    <>
        <div className="">
          <Navbar/>
          <Sidebar/>
          <Calendar/>
        
        </div>
    </>
  )
}

export default Dashboard