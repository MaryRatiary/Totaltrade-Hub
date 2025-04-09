import React, { useState } from 'react';
import './Navbar.css';
import logo from '/tth-removebg.png';
import SearchBar from './SearchBar';
import { FaBriefcase, FaStore, FaUser, FaCog, FaBell } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';

const Navbar = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Nouveau message", time: "Il y a 5 min", read: false },
    { id: 2, message: "Nouvelle commande", time: "Il y a 1 heure", read: false },
    // Ajoutez d'autres notifications de test ici
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    // Marquer toutes les notifications comme lues
    if (!showNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  return (
    <nav className="navbar justify-center ">
      <div className="navbar-brand ">
        <img src={logo} alt="TotalTradeHub Logo" className="navbar-logo" />
        <ul className="navbar-links ">
          <li>
            <a href="/WelcomePage" className='bizina'>
              {isMobile ? <FaBriefcase size={20} /> : "Bizness-Pro"}
            </a>
          </li>
          <li>
            <a href="/WelcomePage"> 
              {isMobile ? <FaStore size={20} /> : "E-Jery"}
            </a>
          </li>
          <li>
          
        <SearchBar className="recherche "/>

          </li>
          <li className="notification-container">
          <button className="notification-button text-[20px]" onClick={handleNotificationClick}>
            {isMobile ? (
              <FaBell size={25} />
            ) : (
              <>
                <FaBell size={25} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </>
            )}
          </button>
          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="notifications-header">
                <h3>Notifications</h3>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="no-notifications">Aucune notification</p>
                )}
              </div>
            </div>
          )}
        </li>
        <li>
          <a href="/profile">
            {isMobile ? <FaUser size={20} /> : "Mon Profile " }
          </a>
        </li>
        <li>
          <a href="/settings">
            {isMobile ? <FaCog size={20} /> : "Settings"}
          </a>
        </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
