import React, { useState, useEffect } from 'react';
import { FaUser, FaBell, FaShieldAlt, FaGlobe, FaPalette, FaMoon, 
         FaLanguage, FaAccessibleIcon, FaDatabase, FaKey, FaSignOutAlt } from 'react-icons/fa';
import './Settings.css';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { settingsService } from '../services/settingsService';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../services/config';

const Settings = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // États pour chaque section de paramètres
  const [profileSettings, setProfileSettings] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    residence: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    twoFactorEnabled: false
  });

  const [notificationSettings, setNotificationSettings] = useState({
    pushEnabled: true,
    emailEnabled: true,
    soundsEnabled: true
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    darkMode: false,
    theme: 'Default',
    fontSize: 'Medium'
  });

  // Charger les paramètres au montage du composant
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
          navigate('/');
          return;
        }

        // Charger les paramètres du profil depuis le backend
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to load user settings');
        
        const userData = await response.json();
        
        // Mettre à jour les états avec les données de l'utilisateur
        setProfileSettings({
          firstName: userData.FirstName || '',
          lastName: userData.LastName || '',
          phone: userData.Phone || '',
          residence: userData.Residence || ''
        });

        // Charger les autres paramètres
        setAppearanceSettings({
          darkMode: userData.DarkModeEnabled || false,
          theme: userData.Theme || 'Default',
          fontSize: userData.FontSize || 'Medium'
        });

        setNotificationSettings({
          pushEnabled: userData.PushNotificationsEnabled ?? true,
          emailEnabled: userData.EmailNotificationsEnabled ?? true,
          soundsEnabled: userData.NotificationSoundsEnabled ?? true
        });

        setSecuritySettings(prev => ({
          ...prev,
          twoFactorEnabled: userData.TwoFactorEnabled || false
        }));

        // Appliquer le mode sombre si activé
        if (userData.DarkModeEnabled) {
          document.body.classList.add('dark-mode');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        toast.error('Erreur lors du chargement des paramètres');
      }
    };

    loadUserSettings();
  }, [navigate]);

  // Gestionnaires d'événements pour chaque section
  const handleProfileUpdate = async () => {
    try {
      setIsLoading(true);
      await settingsService.updateProfile(profileSettings);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du profil');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecurityUpdate = async () => {
    try {
      setIsLoading(true);
      await settingsService.updateSecurity(securitySettings);
      toast.success('Paramètres de sécurité mis à jour');
      setSecuritySettings({ ...securitySettings, currentPassword: '', newPassword: '' });
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des paramètres de sécurité');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationUpdate = async (key, value) => {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings);
    try {
      await settingsService.updateNotifications(newSettings);
      toast.success('Paramètres de notification mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des notifications');
      console.error(error);
    }
  };

  const handleAppearanceUpdate = async (key, value) => {
    const newSettings = { ...appearanceSettings, [key]: value };
    setAppearanceSettings(newSettings);
    try {
      await settingsService.updateAppearance(newSettings);
      toast.success('Apparence mise à jour');
      // Appliquer les changements visuels immédiatement
      if (key === 'darkMode') {
        document.body.classList.toggle('dark-mode', value);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'apparence');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentUser');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
      console.error(error);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        setIsLoading(true);
        await settingsService.deleteAccount();
        localStorage.removeItem('currentUser');
        navigate('/');
        toast.success('Compte supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression du compte');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const sections = [
    {
      title: 'Profile',
      icon: <FaUser />,
      settings: [
        {
          name: 'Prénom',
          type: 'input',
          value: profileSettings.firstName,
          onChange: (e) => setProfileSettings({ ...profileSettings, firstName: e.target.value })
        },
        {
          name: 'Nom',
          type: 'input',
          value: profileSettings.lastName,
          onChange: (e) => setProfileSettings({ ...profileSettings, lastName: e.target.value })
        },
        {
          name: 'Téléphone',
          type: 'input',
          value: profileSettings.phone,
          onChange: (e) => setProfileSettings({ ...profileSettings, phone: e.target.value })
        },
        {
          name: 'Résidence',
          type: 'input',
          value: profileSettings.residence,
          onChange: (e) => setProfileSettings({ ...profileSettings, residence: e.target.value })
        },
        {
          name: 'Sauvegarder les modifications',
          type: 'button',
          action: handleProfileUpdate
        }
      ]
    },
    {
      title: 'Notifications',
      icon: <FaBell />,
      settings: [
        {
          name: 'Notifications push',
          type: 'toggle',
          state: notificationSettings.pushEnabled,
          onChange: (value) => handleNotificationUpdate('pushEnabled', value)
        },
        {
          name: 'Notifications email',
          type: 'toggle',
          state: notificationSettings.emailEnabled,
          onChange: (value) => handleNotificationUpdate('emailEnabled', value)
        },
        {
          name: 'Sons de notification',
          type: 'toggle',
          state: notificationSettings.soundsEnabled,
          onChange: (value) => handleNotificationUpdate('soundsEnabled', value)
        }
      ]
    },
    {
      title: 'Sécurité',
      icon: <FaShieldAlt />,
      settings: [
        {
          name: 'Mot de passe actuel',
          type: 'password',
          value: securitySettings.currentPassword,
          onChange: (e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })
        },
        {
          name: 'Nouveau mot de passe',
          type: 'password',
          value: securitySettings.newPassword,
          onChange: (e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })
        },
        {
          name: 'Authentification à deux facteurs',
          type: 'toggle',
          state: securitySettings.twoFactorEnabled,
          onChange: (value) => setSecuritySettings({ ...securitySettings, twoFactorEnabled: value })
        },
        {
          name: 'Mettre à jour la sécurité',
          type: 'button',
          action: handleSecurityUpdate
        }
      ]
    },
    {
      title: 'Apparence',
      icon: <FaPalette />,
      settings: [
        {
          name: 'Mode sombre',
          type: 'toggle',
          state: appearanceSettings.darkMode,
          onChange: (value) => handleAppearanceUpdate('darkMode', value)
        },
        {
          name: 'Thème',
          type: 'select',
          value: appearanceSettings.theme,
          onChange: (e) => handleAppearanceUpdate('theme', e.target.value),
          options: ['Default', 'Classique', 'Modern']
        },
        {
          name: 'Taille de police',
          type: 'select',
          value: appearanceSettings.fontSize,
          onChange: (e) => handleAppearanceUpdate('fontSize', e.target.value),
          options: ['Petite', 'Moyenne', 'Grande']
        }
      ]
    },
    {
      title: 'Session',
      icon: <FaSignOutAlt />,
      settings: [
        {
          name: 'Déconnexion',
          type: 'button',
          variant: 'danger',
          action: handleLogout
        },
        {
          name: 'Supprimer le compte',
          type: 'button',
          variant: 'danger',
          action: handleDeleteAccount
        }
      ]
    }
  ];

  return (
    <>
      <Navbar />
      <div className="settings-container">
        <h1 className="settings-title">Paramètres</h1>
        <div className="settings-grid">
          {sections.map((section, index) => (
            <div key={index} className="settings-section">
              <div className="section-header">
                {section.icon}
                <h2>{section.title}</h2>
              </div>
              <div className="section-content">
                {section.settings.map((setting, idx) => (
                  <div key={idx} className="setting-item">
                    {renderSettingControl(setting, isLoading)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const renderSettingControl = (setting, isLoading) => {
  switch (setting.type) {
    case 'toggle':
      return (
        <div className="setting-toggle">
          <span>{setting.name}</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={setting.state}
              onChange={(e) => setting.onChange(e.target.checked)}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      );
    case 'select':
      return (
        <div className="setting-select">
          <span>{setting.name}</span>
          <select
            value={setting.value}
            onChange={setting.onChange}
          >
            {setting.options.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    case 'input':
    case 'password':
      return (
        <div className="setting-input">
          <span>{setting.name}</span>
          <input
            type={setting.type}
            value={setting.value}
            onChange={setting.onChange}
            className="form-input"
          />
        </div>
      );
    case 'button':
      return (
        <button
          className={`setting-button ${setting.variant || ''}`}
          onClick={setting.action}
          disabled={isLoading}
        >
          {setting.name}
        </button>
      );
    default:
      return null;
  }
};

export default Settings;
