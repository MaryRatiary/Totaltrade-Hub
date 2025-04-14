import { isOnline, getNetworkInfo } from './networkUtils';
import { isMobileDevice } from './config';

export class ApiError extends Error {
    constructor(message, status, networkDetails = null) {
        super(message);
        this.status = status;
        this.name = 'ApiError';
        this.networkDetails = networkDetails;
        this.timestamp = new Date().toISOString();
    }
}

const getMobileNetworkMessage = (networkInfo) => {
    if (!networkInfo) return '';
    
    const connectionType = networkInfo.effectiveType;
    switch (connectionType) {
        case 'slow-2g':
        case '2g':
            return 'Votre connexion est très faible (2G). Veuillez vous déplacer vers une zone avec une meilleure couverture réseau.';
        case '3g':
            return 'Votre connexion est lente (3G). L\'opération peut prendre plus de temps.';
        case '4g':
            return 'Problème de connexion malgré un bon signal (4G). Veuillez réessayer.';
        default:
            return 'Vérifiez votre connexion mobile et réessayez.';
    }
};

export const handleApiError = (error) => {
    // Vérifier d'abord la connexion internet
    if (!isOnline()) {
        return 'Pas de connexion internet. Veuillez activer vos données mobiles ou vous connecter au Wi-Fi.';
    }

    if (error instanceof ApiError) {
        const networkInfo = getNetworkInfo();
        const isMobile = isMobileDevice();

        // Gérer les erreurs HTTP spécifiques
        switch (error.status) {
            case 401:
                localStorage.removeItem('currentUser');
                window.location.href = '/login';
                return 'Session expirée. Veuillez vous reconnecter.';
            case 403:
                return 'Accès non autorisé.';
            case 404:
                return 'Ressource non trouvée.';
            case 408:
            case 504:
                return isMobile 
                    ? getMobileNetworkMessage(networkInfo)
                    : 'La requête a pris trop de temps. Veuillez réessayer.';
            case 500:
                return 'Erreur serveur. Veuillez réessayer plus tard.';
            case 503:
                return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
            case 0: // Erreur de connexion
                if (isMobile) {
                    const networkMsg = getMobileNetworkMessage(networkInfo);
                    return `Erreur de connexion. ${networkMsg}`;
                }
                return 'Erreur de connexion. Vérifiez votre connexion internet.';
            default:
                // Ajouter les informations réseau pour le débogage
                console.error('Détails de l\'erreur:', {
                    status: error.status,
                    message: error.message,
                    networkInfo,
                    timestamp: error.timestamp,
                    isMobile
                });
                
                return isMobile
                    ? 'Erreur lors de la connexion au serveur. Vérifiez votre connexion mobile et réessayez.'
                    : 'Une erreur est survenue. Veuillez réessayer.';
        }
    }

    // Si c'est une erreur de timeout
    if (error.name === 'AbortError') {
        return isMobileDevice()
            ? 'La connexion est trop lente. Veuillez vérifier votre connexion mobile ou réessayer plus tard.'
            : 'La requête a pris trop de temps. Veuillez réessayer.';
    }

    return 'Une erreur inattendue est survenue. Veuillez réessayer.';
};