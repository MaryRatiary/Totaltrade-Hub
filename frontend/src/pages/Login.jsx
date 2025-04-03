import React from 'react';
import { useNavigate } from 'react-router-dom';
const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5131/api/Auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: document.getElementById('email').value,
          password: document.getElementById('password').value,
        }),
      });

      const data = await response.json();
      console.log('Login response:', data);

      if (response.ok) {
        // Stocker les données utilisateur avec les bonnes clés
        const userData = {
          firstName: data.user.FirstName,
          lastName: data.user.LastName,
          email: data.user.Email,
          phone: data.user.Phone,
          birthdate: data.user.Birthdate,
          residence: data.user.Residence,
          photo: data.user.Photo,
          id: data.user.Id
        };

        console.log('Storing user data:', userData);
        localStorage.setItem('currentUser', JSON.stringify(userData));
        
        // Ajouter un petit délai pour s'assurer que les données sont stockées
        setTimeout(() => {
          navigate('/Actualite');
        }, 100);
      } else {
        alert(data.message || 'Échec de la connexion');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Erreur de connexion. Veuillez réessayer.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      <Link
        className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        to="/register"
      >
        S'inscrire
      </Link>
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Se connecter</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              placeholder="Email"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Mot de passe
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="********"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={handleLogin}
            >
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;