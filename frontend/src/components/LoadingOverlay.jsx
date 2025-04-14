import React from 'react';
import Spinner from './Spinner';

const LoadingOverlay = ({ message = 'Chargement...' }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center">
        <Spinner size="large" className="mb-4" />
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;