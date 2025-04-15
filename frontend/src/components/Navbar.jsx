import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import logo from '/tth-removebg.png';
import SearchBar from './SearchBar';
import { FaBriefcase, FaStore, FaUser, FaCog, FaBell, FaBars, FaTimes } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { API_BASE_URL } from '../services/config';

const Navbar = () => {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
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

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="navbar justify-center">
      <div className="navbar-brand" ref={menuRef}>
        <img src={logo} alt="TotalTradeHub Logo" className="navbar-logo" />
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <FaTimes size={25} /> : <FaBars size={25} />}
        </button>

        <ul className={`navbar-links ${isMobile ? 'mobile' : ''} ${isMenuOpen ? 'active' : ''}`}>
          <li>
            <a href="/WelcomePage" className="bizina" onClick={handleLinkClick}>
              {isMobile ? (
                <>
                  <FaBriefcase size={20} />
                  <span>Bizness-Pro</span>
                </>
              ) : (
                "Bizness-Pro"
              )}
            </a>
          </li>
          <li>
            <a href="/Welcome" onClick={handleLinkClick}>
              {isMobile ? (
                <>
                  <FaStore size={20} />
                  <span>E-Jery</span>
                </>
              ) : (
                "E-Jery"
              )}
            </a>
          </li>
          <li className="search-container">
            <SearchBar className="recherche" />
          </li>
          <li className="notification-container">
            <button 
              className="notification-button text-[20px]" 
              onClick={(e) => {
                e.stopPropagation();
                handleNotificationClick();
              }}
            >
              <FaBell size={25} />
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
          <li className="nav-item">
            <a href="/profile" onClick={handleLinkClick}>
              {isMobile ? (
                <>
                  <FaUser size={20} />
                  <span>Mon Profile</span>
                </>
              ) : (
                "Mon Profile"
              )}
            </a>
          </li>
          <li className="nav-item">
            <a href="/settings" onClick={handleLinkClick}>
              {isMobile ? (
                <>
                  <FaCog size={20} />
                  <span>Settings</span>
                </>
              ) : (
                "Settings"
              )}
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
