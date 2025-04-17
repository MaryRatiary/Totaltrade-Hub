import { API_BASE_URL, getAuthHeaders } from './config';

class ApiService {
    async login(credentials) {
        console.log('Tentative de connexion avec:', { email: credentials.email, hasPassword: !!credentials.password });
        
        try {
            console.log('Envoi de la requête à:', `${API_BASE_URL}/auth/login`);
            
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            console.log('Réponse reçue:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            const data = await response.json();
            console.log('Données reçues:', data);
            
            if (!response.ok) {
                throw new Error(data.message || 'Erreur lors de la connexion');
            }

            return data;
        } catch (error) {
            console.error('Erreur détaillée:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async register(userData) {
        return this.makeRequest('register', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/Auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            return this.handleResponse(response);
        });
    }

    async completeRegistration(email) {
        return this.makeRequest('completeRegistration', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/Auth/complete-registration`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Email': email
                }
            });
            return this.handleResponse(response);
        });
    }

    async getArticles() {
        return this.makeRequest('getArticles', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/articles`, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async createArticle(formData) {
        return this.makeRequest('createArticle', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/articles`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: formData,
            });
            return this.handleResponse(response);
        });
    }

    async getUserProfile(userId = null) {
        return this.makeRequest(`getUserProfile-${userId || 'self'}`, async () => {
            const endpoint = userId ? `${API_BASE_URL}/users/${userId}` : `${API_BASE_URL}/users/profile`;
            const response = await fetchWithRetry(endpoint, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async updateProfile(profileData) {
        return this.makeRequest('updateProfile', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/settings/profile`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(profileData),
            });
            return this.handleResponse(response);
        });
    }

    async sendFriendRequest(receiverId) {
        return this.makeRequest('sendFriendRequest', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/friendrequest/send`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ receiverId }),
            });
            return this.handleResponse(response);
        });
    }

    async getFriendRequests() {
        return this.makeRequest('getFriendRequests', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/friendrequest/pending`, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async handleFriendRequest(requestId, action) {
        return this.makeRequest(`handleFriendRequest-${requestId}-${action}`, async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/friendrequest/${requestId}/${action}`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async getMessages(userId) {
        return this.makeRequest(`getMessages-${userId}`, async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/message/messages/${userId}`, {
                headers: getAuthHeaders(),
            });
            return this.handleResponse(response);
        });
    }

    async sendMessage(receiverId, content) {
        return this.makeRequest('sendMessage', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/message/send`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ receiverId, content }),
            });
            return this.handleResponse(response);
        });
    }

    async uploadProfilePicture(file) {
        return this.makeRequest('uploadProfilePicture', async () => {
            const formData = new FormData();
            formData.append('image', file);
            
            const response = await fetchWithRetry(`${API_BASE_URL}/users/profile-picture`, {
                method: 'POST',
                headers: {
                    'Authorization': getAuthHeaders().Authorization
                },
                body: formData
            });
            return this.handleResponse(response);
        });
    }

    async updateSettings(settingsData) {
        return this.makeRequest('updateSettings', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/settings`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(settingsData)
            });
            return this.handleResponse(response);
        });
    }

    async getConversations() {
        return this.makeRequest('getConversations', async () => {
            const response = await fetchWithRetry(`${API_BASE_URL}/message/conversations`, {
                headers: getAuthHeaders()
            });
            return this.handleResponse(response);
        });
    }

    async handleResponse(response) {
        const data = await response.json();
        if (!response.ok) {
            throw new ApiError(data.message || 'Une erreur est survenue', response.status);
        }
        return data;
    }
}

export const apiService = new ApiService();