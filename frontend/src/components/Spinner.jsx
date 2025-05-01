import React from 'react';

const Spinner = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className={`inline-block animate-spin ${sizeClasses[size]} ${className}`}>
      <div className="border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full w-full h-full"></div>
    </div>
  );
};

export default Spinner;