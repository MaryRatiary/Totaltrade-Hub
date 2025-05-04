import { API_BASE_URL } from './config';

export const settingsService = {
  async updateProfile(profileData) {
    const response = await fetch(`${API_BASE_URL}/settings/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('currentUser')).token}`
      },
      body: JSON.stringify(profileData)
    });
    if (!response.ok) throw new Error('Failed to update profile');
    return response.json();
  },

  async updateSecurity(securityData) {
    const response = await fetch(`${API_BASE_URL}/settings/security`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('currentUser')).token}`
      },
      body: JSON.stringify(securityData)
    });
    if (!response.ok) throw new Error('Failed to update security settings');
    return response.json();
  },

  async updateNotifications(notificationSettings) {
    const response = await fetch(`${API_BASE_URL}/settings/notifications`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('currentUser')).token}`
      },
      body: JSON.stringify(notificationSettings)
    });
    if (!response.ok) throw new Error('Failed to update notification settings');
    return response.json();
  },

  async updateAppearance(appearanceSettings) {
    const response = await fetch(`${API_BASE_URL}/settings/appearance`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('currentUser')).token}`
      },
      body: JSON.stringify(appearanceSettings)
    });
    if (!response.ok) throw new Error('Failed to update appearance settings');
    return response.json();
  },

  async deleteAccount() {
    const response = await fetch(`${API_BASE_URL}/settings/account`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${JSON.parse(localStorage.getItem('currentUser')).token}`
      }
    });
    if (!response.ok) throw new Error('Failed to delete account');
    return response.json();
  }
};