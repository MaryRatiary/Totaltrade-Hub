// Récupérer l'IP du serveur en fonction de l'environnement
const getApiBaseUrl = () => {
    // En développement, utiliser l'IP du serveur pour permettre l'accès externe
    if (process.env.NODE_ENV === 'development') {
        return 'http://192.168.88.101:5131/api';
    }
    return process.env.VITE_API_URL || 'http://192.168.88.101:5131/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Détecter si l'utilisateur est sur mobile
export const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const getConfig = () => {
    return {
        retryAttempts: 3,
        retryDelay: 2000,
    };
};

export const getAuthHeaders = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    return {
        'Content-Type': 'application/json',
        'Authorization': currentUser?.token ? `Bearer ${currentUser.token}` : '',
        'Accept': 'application/json'
    };
};

export const handleApiError = (error) => {
    console.error('API Error:', error);
    return {
        message: error.message || 'Une erreur est survenue',
        status: error.status || 500
    };
};