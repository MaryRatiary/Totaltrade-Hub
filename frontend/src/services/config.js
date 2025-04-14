// Récupérer l'IP du serveur en fonction de l'environnement
const getApiBaseUrl = () => {
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:5131/api';
    }
    return process.env.VITE_API_URL || 'http://localhost:5131/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Détecter si l'utilisateur est sur mobile
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Configuration des paramètres en fonction du type d'appareil
export const getConfig = () => {
    const isMobile = isMobileDevice();
    return {
        retryAttempts: isMobile ? 10 : 5, // Plus de tentatives sur mobile
        retryDelay: isMobile ? 3000 : 2000, // Délai plus long entre les tentatives sur mobile
    };
};

export const getAuthHeaders = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return {
        'Content-Type': 'application/json',
        'Authorization': currentUser?.token ? `Bearer ${currentUser.token}` : '',
        'X-Client-Type': isMobileDevice() ? 'mobile' : 'desktop',
        'X-Network-Type': navigator?.connection?.effectiveType || 'unknown'
    };
};