import { API_BASE_URL } from './config';

let networkListeners = new Set();
let isCheckingConnection = false;

export const checkApiConnection = async () => {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'HEAD'
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

export const isOnline = () => {
    return navigator.onLine;
};

export const getNetworkInfo = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (!connection) {
        return {
            type: 'unknown',
            effectiveType: 'unknown',
            downlink: null,
            rtt: null,
            saveData: false
        };
    }

    return {
        type: connection.type,
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
    };
};

export const startNetworkMonitoring = (callback) => {
    const handleNetworkChange = async () => {
        if (isCheckingConnection) return;
        isCheckingConnection = true;

        const online = navigator.onLine;
        const apiAvailable = online ? await checkApiConnection() : false;
        const networkInfo = getNetworkInfo();

        networkListeners.forEach(listener => 
            listener({
                online,
                apiAvailable,
                networkInfo,
                timestamp: new Date().toISOString()
            })
        );

        isCheckingConnection = false;
    };

    networkListeners.add(callback);

    if (networkListeners.size === 1) {
        window.addEventListener('online', handleNetworkChange);
        window.addEventListener('offline', handleNetworkChange);
        
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            connection.addEventListener('change', handleNetworkChange);
        }
    }

    // Initial check
    handleNetworkChange();

    // Return cleanup function
    return () => {
        networkListeners.delete(callback);
        
        if (networkListeners.size === 0) {
            window.removeEventListener('online', handleNetworkChange);
            window.removeEventListener('offline', handleNetworkChange);
            
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                connection.removeEventListener('change', handleNetworkChange);
            }
        }
    };
};