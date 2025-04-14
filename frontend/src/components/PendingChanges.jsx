import React, { useState, useEffect } from 'react';
import { offlineStorage } from '../services/offlineStorage';

const PendingChanges = () => {
    const [pendingChanges, setPendingChanges] = useState([]);

    useEffect(() => {
        const checkPendingChanges = async () => {
            const changes = await offlineStorage.getPendingRequests();
            setPendingChanges(changes);
        };

        checkPendingChanges();
        const interval = setInterval(checkPendingChanges, 5000);

        return () => clearInterval(interval);
    }, []);

    if (pendingChanges.length === 0) return null;

    return (
        <div className="fixed bottom-16 left-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                    Modifications en attente
                </h3>
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-sm">
                    {pendingChanges.length}
                </span>
            </div>
            <div className="text-sm text-gray-600">
                <p>
                    Certaines modifications n'ont pas pu être enregistrées en raison de problèmes de connexion.
                    Elles seront automatiquement synchronisées dès que la connexion sera rétablie.
                </p>
                <div className="mt-2">
                    {pendingChanges.map((change, index) => (
                        <div key={change.id || index} className="text-xs text-gray-500 mt-1">
                            • {change.method} {new URL(change.url).pathname}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PendingChanges;