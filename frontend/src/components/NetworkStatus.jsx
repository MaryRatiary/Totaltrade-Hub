import React from 'react';

const NetworkStatus = ({ isOnline }) => {
  return (
    <div className={`network-status ${isOnline ? 'online' : 'offline'}`}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  );
};

export default NetworkStatus;
