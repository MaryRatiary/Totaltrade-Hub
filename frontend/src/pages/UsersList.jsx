import React, { useState, useEffect } from 'react';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        console.log('Fetching users...');
        
        const response = await fetch('http://localhost:5131/api/Users', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data);
        
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="text-center p-4">Chargement...</div>;
  if (error) return <div className="text-red-500 text-center p-4">Erreur: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Liste des Utilisateurs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map(user => (
          <div key={user.Id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-start space-x-4">
              {user.Photo && (
                <img 
                  src={user.Photo} 
                  alt={`${user.FirstName} ${user.LastName}`}
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div>
                <h2 className="text-xl font-semibold">
                  {user.FirstName} {user.LastName}
                </h2>
                <p className="text-gray-600">{user.Email}</p>
                <p className="text-gray-500">{user.Phone}</p>
                <p className="text-gray-500">{user.Residence}</p>
                <p className="text-gray-500">
                  {user.Birthdate ? new Date(user.Birthdate).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Non spécifiée'}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
