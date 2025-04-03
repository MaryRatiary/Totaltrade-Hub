import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccountCreation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const createAccount = async () => {
      try {
        const email = localStorage.getItem('userEmail');
        const response = await fetch('http://localhost:5135/api/Auth/complete-registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Email': email
          }
        });

        const data = await response.json();
        console.log('Complete registration response:', data);

        if (response.ok) {
          navigate('/');
        } else {
          console.error('Failed to complete registration:', data.message);
          navigate('/register');
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/register');
      }
    };

    createAccount();
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