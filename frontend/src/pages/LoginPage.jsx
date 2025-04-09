import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Assuming you have a CSS file for styling
import logo from '/tth-removebg.png';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5131/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('currentUser', JSON.stringify({
        token: data.token,
        ...data.user
      }));
      
      navigate('/WelcomePage'); // Navigate to WelcomePage after login
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <> <div className='aito relative mb-0'>

<img src={logo} alt="TotalTradeHub Logo" className='relative w-50 h-50'/>
      <article  className=' '>
      <Link
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        to="/register"
      >
        S'inscrire
      </Link>

    </article>
 
    <div className="login-container absolute w-full">
      <form onSubmit={handleSubmit} className="login-form">
        
        <h2>Connexion</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          placeholder="Email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
    </div>
    </div>
   
    </>
  );
};

export default LoginPage;
