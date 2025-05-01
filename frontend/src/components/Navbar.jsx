import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '/tth-removebg.png';
import SearchBar from './SearchBar';
import { FaHome, FaStore, FaUser, FaCog, FaBell } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { API_BASE_URL } from '../services/config';

const Navbar = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.token) return;

    try {
      const friendResponse = await fetch(`${API_BASE_URL}/friendrequest/pending`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (friendResponse.ok) {
        const friendRequests = await friendResponse.json();
        const notifications = friendRequests.map(req => ({
          id: req.requestId,
          type: 'friend_request',
          message: `${req.senderName} vous a envoyé une demande d'ami`,
          time: new Date(req.sentAt).toLocaleString(),
          senderId: req.senderId,
          read: false,
          actions: ['accept', 'reject']
        }));

        setNotifications(notifications);
        setUnreadCount(notifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationAction = async (notificationId, action) => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/friendrequest/${notificationId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(notifications.filter(n => n.id !== notificationId));
        setUnreadCount(prev => prev - 1);
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error handling notification action:', error);
    }
  };

  const handleLinkClick = () => {
    setShowNotifications(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand" ref={menuRef}>
        <img src={logo} alt="TotalTradeHub Logo" className="navbar-logo" />
        
        <ul className="navbar-links">
          <li>
            <a href="/WelcomePage" onClick={handleLinkClick}>
              <FaHome size={isMobile ? 24 : 20} />
              <span>Accueil</span>
            </a>
          </li>
          <li>
            <a href="/ejery" onClick={handleLinkClick}>
              <FaStore size={isMobile ? 24 : 20} />
              <span>E-Jery</span>
            </a>
          </li>
          <li className="search-container">
            <SearchBar className="recherche" />
          </li>
          <li className="notification-container">
            <button 
              className="notification-button" 
              onClick={(e) => {
                e.stopPropagation();
                setShowNotifications(!showNotifications);
              }}
            >
              <FaBell size={isMobile ? 24 : 20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
            {showNotifications && (
              <div className="notifications-dropdown" onClick={e => e.stopPropagation()}>
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
                        {notification.type === 'friend_request' && (
                          <div className="notification-actions">
                            <button 
                              onClick={() => handleNotificationAction(notification.id, 'accept')}
                              className="accept-button"
                            >
                              Accepter
                            </button>
                            <button 
                              onClick={() => handleNotificationAction(notification.id, 'reject')}
                              className="reject-button"
                            >
                              Refuser
                            </button>
                          </div>
                        )}
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
            <a href="/profile" onClick={handleLinkClick}>
              <FaUser size={isMobile ? 24 : 20} />
              <span>Mon Profile</span>
            </a>
          </li>
          <li>
            <a href="/settings" onClick={handleLinkClick}>
              <FaCog size={isMobile ? 24 : 20} />
              <span>Settings</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
