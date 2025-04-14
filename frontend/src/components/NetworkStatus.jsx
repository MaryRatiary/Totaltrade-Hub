import React, { useEffect, useState } from 'react';
import { startNetworkMonitoring } from '../services/networkUtils';

const NetworkStatus = () => {
    const [networkState, setNetworkState] = useState({
        online: navigator.onLine,
        apiAvailable: true,
        networkInfo: null,
        isVisible: false
    });

    useEffect(() => {
        const cleanup = startNetworkMonitoring(({ online, apiAvailable, networkInfo }) => {
            setNetworkState(prev => ({
                online,
                apiAvailable,
                networkInfo,
                isVisible: !online || !apiAvailable
            }));
        });

        return cleanup;
    }, []);

    if (!networkState.isVisible) return null;

    const getStatusMessage = () => {
        if (!networkState.online) {
            return 'Vous êtes hors ligne. Vérifiez votre connexion internet.';
        }
        if (!networkState.apiAvailable) {
            return 'Problème de connexion au serveur. Tentative de reconnexion...';
        }
        if (networkState.networkInfo?.effectiveType === 'slow-2g' || networkState.networkInfo?.effectiveType === '2g') {
            return 'Connexion très lente. Certaines fonctionnalités peuvent ne pas fonctionner correctement.';
        }
        return 'Connexion instable. Les données peuvent mettre du temps à se charger.';
    };

    return (
        <div className={`fixed bottom-0 left-0 right-0 p-4 text-white text-center transition-all duration-300 ${
            networkState.online ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
            <p className="text-sm">{getStatusMessage()}</p>
        </div>
    );
};

export default NetworkStatus;
