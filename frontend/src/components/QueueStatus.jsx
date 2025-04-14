import React from 'react';
import { useRetryQueue } from '../hooks/useRetryQueue';

const QueueStatus = () => {
    const { hasItemsInQueue, queueSize, isProcessing } = useRetryQueue();

    if (!hasItemsInQueue) return null;

    return (
        <div className="fixed top-4 right-4 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            <div className="flex items-center space-x-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        fill="none"
                    />
                    <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
                <span>
                    {isProcessing 
                        ? `Nouvelle tentative de connexion... (${queueSize} ${queueSize > 1 ? 'requêtes' : 'requête'} en attente)`
                        : `${queueSize} ${queueSize > 1 ? 'requêtes' : 'requête'} en attente de reconnexion`
                    }
                </span>
            </div>
        </div>
    );
};

export default QueueStatus;