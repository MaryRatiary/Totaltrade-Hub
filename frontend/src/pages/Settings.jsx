import React, { useState } from 'react';
import { FaUser, FaBell, FaShieldAlt, FaGlobe, FaPalette, FaMoon, 
         FaLanguage, FaAccessibleIcon, FaDatabase, FaKey, FaSignOutAlt } from 'react-icons/fa';
import './Settings.css';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Pas besoin d'appeler l'API puisqu'on gère le logout côté client
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const sections = [
    {
      title: 'Profile',
      icon: <FaUser />,
      settings: [
        { name: 'Modifier le profil', type: 'link', path: '/edit-profile' },
        { name: 'Changer la photo', type: 'link', path: '/change-photo' },
        { name: 'Gérer les informations personnelles', type: 'link', path: '/personal-info' }
      ]
    },
    {
      title: 'Notifications',
      icon: <FaBell />,
      settings: [
        { name: 'Notifications push', type: 'toggle', state: notificationsEnabled, 
          onChange: setNotificationsEnabled },
        { name: 'Notifications email', type: 'toggle', state: true },
        { name: 'Sons de notification', type: 'toggle', state: true }
      ]
    },
    {
      title: 'Sécurité',
      icon: <FaShieldAlt />,
      settings: [
        { name: 'Authentification à deux facteurs', type: 'link', path: '/2fa' },
        { name: 'Changer le mot de passe', type: 'link', path: '/change-password' },
        { name: 'Appareils connectés', type: 'link', path: '/devices' }
      ]
    },
    {
      title: 'Confidentialité',
      icon: <FaKey />,
      settings: [
        { name: 'Visibilité du profil', type: 'select', 
          options: ['Public', 'Privé', 'Contacts uniquement'] },
        { name: 'Historique des activités', type: 'link', path: '/activity' }
      ]
    },
    {
      title: 'Apparence',
      icon: <FaPalette />,
      settings: [
        { name: 'Mode sombre', type: 'toggle', state: darkMode, onChange: setDarkMode },
        { name: 'Thème', type: 'select', options: ['Default', 'Classique', 'Modern'] },
        { name: 'Taille de police', type: 'select', options: ['Petite', 'Moyenne', 'Grande'] }
      ]
    },
    {
      title: 'Langue et Région',
      icon: <FaLanguage />,
      settings: [
        { name: 'Langue', type: 'select', value: language, onChange: setLanguage,
          options: ['Français', 'English', 'Español', 'Deutsch'] },
        { name: 'Fuseau horaire', type: 'select', 
          options: ['UTC+1', 'UTC+2', 'UTC+3', 'UTC+4'] },
        { name: 'Format de date', type: 'select', 
          options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] }
      ]
    },
    {
      title: 'Accessibilité',
      icon: <FaAccessibleIcon />,
      settings: [
        { name: 'Contraste élevé', type: 'toggle', state: false },
        { name: 'Animations réduites', type: 'toggle', state: false },
        { name: 'Lecteur d\'écran', type: 'toggle', state: false }
      ]
    },
    {
      title: 'Données et stockage',
      icon: <FaDatabase />,
      settings: [
        { name: 'Gérer le stockage', type: 'link', path: '/storage' },
        { name: 'Télécharger mes données', type: 'button', action: () => {} },
        { name: 'Supprimer le compte', type: 'button', variant: 'danger' }
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
                    {renderSettingControl(setting)}
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

const renderSettingControl = (setting) => {
  switch (setting.type) {
    case 'toggle':
      return (
        <div className="setting-toggle">
          <span>{setting.name}</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={setting.state}
              onChange={(e) => setting.onChange?.(e.target.checked)}
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
            onChange={(e) => setting.onChange?.(e.target.value)}
          >
            {setting.options.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </select>
        </div>
      );
    case 'button':
      return (
        <button
          className={`setting-button ${setting.variant || ''}`}
          onClick={setting.action}
        >
          {setting.name}
        </button>
      );
    default:
      return (
        <a href={setting.path} className="setting-link">
          {setting.name}
        </a>
      );
  }
};

export default Settings;
