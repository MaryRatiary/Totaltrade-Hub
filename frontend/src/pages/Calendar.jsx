import React from "react";
import "../assets/styles/calendar.css";
import Sidebar from "../components/Sidebar";
import Customers from "../components/Customers";

const Calendar = () => {
  return (
    <>
     <Sidebar/>
      <div className="dashboard-container flex-col mt-8 !right-[20px]">
        {/* <div className="sidebar">
          <h2 className="sidebar-title">BON PLAN</h2>
          <ul className="sidebar-menu">
            <li>Dashboard</li>
            <li>Customers</li>
            <li>Messages</li>
            <li>Help</li>
            <li>Settings</li>
          </ul>
        </div> */}
       
        <div className="calendar-main mt-4 ">
          <div className="calendar-container mt-6">
            <div className="calendar-left">
              <div className="calendar-header">
                <button className="prev-btn">&lt;</button>
                <div className="current-date bg-gray-100 p-3 rounded-2xl">December 2022</div>
                <button className="next-btn">&gt;</button>
              </div>
              <div className="calendar-weekdays">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="calendar-days"></div>
              <div className="calendar-footer">
                <div className="goto-section">
                  <input type="text" placeholder="MM/YYYY" className="date-input" />
                  <button className="goto-btn">Go</button>
                </div>
                <button className="today-btn">Today</button>
              </div>
            </div>
            <div className="calendar-right">
              <div className="today-info">
                <div className="event-day">Wednesday</div>
                <div className="event-date">12th December 2022</div>
              </div>
              <div className="events-list"></div>
              <div className="add-event-section">
                <div className="add-event-header">
                  <h3>Add Event</h3>
                  <button className="close-btn">&times;</button>
                </div>
                <div className="add-event-body">
                  <input type="text" placeholder="Event Name" className="event-name" />
                  <input type="time" placeholder="From" className="event-time-from" />
                  <input type="time" placeholder="To" className="event-time-to" />
                </div>
                <div className="add-event-footer">
                  <button className="add-event-btn">Add Event</button>
                </div>
              </div>
            </div>
          </div>
          <button className="add-event-btn-circle">
            <i className="fas fa-plus"></i>
          </button>
        </div>
        </div>
        <div className="  t-0 absolute w-[75%] bg-white p-4 shadow-lg right-0  flex flex-col">
            {/* Action Trackng */}
            <div className="recentOrders mb-6 inline">
              <div className="cardHeader flex justify-between items-center">
                <h2 className="text-lg font-bold">Action Tracking</h2>
                <a href="#" className="btn bg-blue-500 text-white px-4 py-2 rounded">View All</a>
              </div>
              <table className="w-full mt-4 border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <td className="p-2 border">Action</td>
                    <td className="p-2 border">Date</td>
                    <td className="p-2 border">Status</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border">Event Created</td>
                    <td className="p-2 border">12th Dec 2022</td>
                    <td className="p-2 border"><span className="status delivered bg-green-200 px-2 py-1 rounded">Completed</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Profile Updated</td>
                    <td className="p-2 border">10th Dec 2022</td>
                    <td className="p-2 border"><span className="status inProgress bg-yellow-200 px-2 py-1 rounded">In Progress</span></td>
                  </tr>
                  <tr>
                    <td className="p-2 border">Joined Group</td>
                    <td className="p-2 border">8th Dec 2022</td>
                    <td className="p-2 border"><span className="status pending bg-red-200 px-2 py-1 rounded">Pending</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Monthly Insights */}
            <div className="recentCustomers">
              <div className="cardHeader mb-4">
                <h2 className="text-lg font-bold">Monthly Insights</h2>
              </div>
              <ul className="insights-list space-y-2">
                <li>Total Events Created: <span className="font-bold">15</span></li>
                <li>New Users Joined: <span className="font-bold">120</span></li>
                <li>Messages Sent: <span className="font-bold">450</span></li>
                <li>Groups Created: <span className="font-bold">8</span></li>
              </ul>
            </div>
            <Customers/>
          </div>
        
        
      

    </>
  );
};

export default Calendar;