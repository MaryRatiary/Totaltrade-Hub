import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { API_BASE_URL } from '../services/config';

const AccountCreation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const completeRegistration = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        if (!email) {
          navigate('/register');
          return;
        }

        const response = await fetch(`${API_BASE_URL}/user/complete-profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error('Failed to complete registration');
        }

        navigate('/');
      } catch (error) {
        console.error('Error:', error);
        navigate('/register');
      }
    };

    completeRegistration();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-6">Création de votre compte</h2>
        <p>Chargement...</p>
      </div>
    </div>
  );
};

export default AccountCreation;