import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Urprofile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newProfilePicture, setNewProfilePicture] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    console.log('User data from localStorage:', userJson);
    
    if (!userJson) {
      console.log('No user data found, redirecting to login');
      navigate('/');
      return;
    }

    try {
      const userData = JSON.parse(userJson);
      console.log('Parsed user data:', userData);
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProfilePicture(reader.result);
        uploadProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProfilePicture = async (base64Image) => {
    try {
      const response = await fetch(`http://localhost:5131/api/users/${user.id}/profile-picture`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64Image }),
      });

      if (response.ok) {
        setUser({ ...user, profilePicture: base64Image });
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
            {/* Profile Picture Section */}
            <div className="relative">
              <div 
                className="w-40 h-40 rounded-full border-2 border-gray-200 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleProfilePictureClick}
              >
                <img
                  src={newProfilePicture || user.profilePicture || '/default-avatar.png'}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">Change Photo</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>

            {/* Profile Info Section */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-2xl font-semibold">{user.username}</h1>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </div>

              <div className="flex space-x-8 mb-4">
                <div>
                  <span className="font-semibold">{user.articles?.length || 0}</span>
                  {' '}posts
                </div>
                <div>
                  <span className="font-semibold">0</span> followers
                </div>
                <div>
                  <span className="font-semibold">0</span> following
                </div>
              </div>

              <div className="space-y-2">
                <p className="font-semibold">{`${user.firstName} ${user.lastName}`}</p>
                <p className="text-gray-600">{user.residence || 'No location added'}</p>
                <p className="text-gray-600">{user.phone || 'No phone added'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Posts Grid Section */}
        <div className="grid grid-cols-3 gap-4">
          {user.articles?.map((article) => (
            <div key={article.id} className="aspect-square bg-gray-200 rounded-md overflow-hidden">
              <img
                src={article.photo || '/default-post.png'}
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Urprofile;
