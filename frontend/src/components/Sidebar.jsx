import React, { useState, useEffect } from 'react';
import './Sidebar.css'; // Assurez-vous d'importer le fichier CSS

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  let hideTimeout;

  const showSidebar = () => {
    clearTimeout(hideTimeout);
    setIsOpen(true);
  };

  const hideSidebar = () => {
    hideTimeout = setTimeout(() => {
      setIsOpen(false);
    }, 2000);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (e.clientX <= 10) {
        showSidebar();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(hideTimeout);
    };
  }, []);

  return (
    <>
      <div
        className={`sidebar ${isOpen ? 'open' : 'closed'}`}
        onMouseEnter={showSidebar}
        onMouseLeave={hideSidebar}
      >
        <ul>
          <li><a href="/dashboard">Dashboard</a></li>
          <li><a href="/messages">Messages</a></li>
          <li><a href="/notifications">Notifications</a></li>
        </ul>
      </div>
    </>
  );
};

export default Sidebar;
