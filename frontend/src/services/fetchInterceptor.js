import { checkApiConnection, getNetworkInfo } from './networkUtils';
import { ApiError } from './errorHandler';
import { retryQueue } from './retryQueue';
import { offlineStorage } from './offlineStorage';
import { getConfig } from './config';

const isNetworkError = (error) => {
    return (
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('net::ERR') ||
        !navigator.onLine
    );
};

const serializeRequest = (url, options) => {
    const { headers, ...rest } = options;
    return {
        url,
        headers: headers ? Object.fromEntries(new Headers(headers).entries()) : {},
        ...rest
    };
};

export const fetchWithRetry = async (url, options = {}) => {
    const fetchOperation = async () => {
        try {
            const response = await fetch(url, {
                ...options,
            });

            if (response.ok) {
                return response;
            }

            const errorData = await response.text();
            throw new ApiError(errorData, response.status);
        } catch (error) {
            if (isNetworkError(error)) {
                if (options.method && options.method !== 'GET') {
                    await offlineStorage.addPendingRequest(serializeRequest(url, options));
                }

                const requestKey = `${options.method || 'GET'}-${url}-${Date.now()}`;
                const config = getConfig();
                
                return retryQueue.add(requestKey, () => fetchOperation(), {
                    onSuccess: async () => {
                        const pendingRequests = await offlineStorage.getPendingRequests();
                        const matchingRequest = pendingRequests.find(req => 
                            req.url === url && 
                            req.method === options.method
                        );
                        if (matchingRequest) {
                            await offlineStorage.removePendingRequest(matchingRequest.id);
                        }
                    },
                    retryAttempts: config.retryAttempts,
                    retryDelay: config.retryDelay
                });
            }
            
            throw error;
        }
    };

    try {
        const pendingRequests = await offlineStorage.getPendingRequests();
        if (pendingRequests.length > 0) {
            for (const request of pendingRequests) {
                const { id, ...requestData } = request;
                try {
                    await fetchOperation(requestData.url, requestData);
                    await offlineStorage.removePendingRequest(id);
                } catch (error) {
                    console.error('Failed to replay pending request:', error);
                }
            }
        }

        return await fetchOperation();
    } catch (error) {
        throw new ApiError(
            `Erreur de connexion. ${
                navigator.onLine 
                    ? 'Vérifiez votre connexion internet ou réessayez plus tard.' 
                    : 'Vous êtes hors ligne. Vos modifications seront synchronisées une fois la connexion rétablie.'
            }`,
            0,
            getNetworkInfo()
        );
    }
};