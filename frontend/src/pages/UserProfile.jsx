import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef(null);
  const API_BASE_URL = 'http://localhost:5131/api';
  const [showPhotoDropdown, setShowPhotoDropdown] = useState(false);
  const [previousPhotos, setPreviousPhotos] = useState([]);

  const loadUserProfile = async () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser?.token) {
      navigate('/login');
      return;
    }

    try {
      console.log('Sending request with token:', currentUser.token);
      
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('currentUser');
        navigate('/login');
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching profile');
      }

      setUser(prev => ({
        ...prev,
        ...data,
        token: currentUser.token
      }));

    } catch (error) {
      console.error('Error fetching profile:', error);
      alert(error.message);
    }
  };

  const loadPreviousPhotos = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/photos`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPreviousPhotos(data);
      }
    } catch (error) {
      console.error('Error loading previous photos:', error);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        }
      });
      if (response.ok) {
        loadPreviousPhotos();
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const handleSelectPhoto = async (photoUrl) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}/profile-picture`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ photoUrl })
      });
      if (response.ok) {
        setUser(prev => ({ ...prev, profilePicture: photoUrl }));
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file, file.name);

      try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const response = await fetch(`${API_BASE_URL}/users/profile-picture`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${currentUser.token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to upload profile picture');
        }

        const result = await response.json();
        if (result.profilePictureUrl) {
          setUser(prev => ({
            ...prev,
            profilePicture: result.profilePictureUrl
          }));
          // Clear file input
          event.target.value = '';
        }
      } catch (error) {
        console.error('Error uploading profile picture:', error);
        alert(error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className=" mt-10 container mx-auto px-4 py-8 max-w-4xl">
        {user ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              {/* Profile Content */}
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="relative">
                  {/* Profile Image */}
                  <div 
                    className="w-40 h-40 rounded-full border-2 border-gray-200 overflow-hidden cursor-pointer"
                    onClick={() => setShowPhotoDropdown(!showPhotoDropdown)}
                  >
                    <img
                      src={user.profilePicture || '/default-avatar.png'}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Photo Upload Button */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>

                  {/* Photos Dropdown */}
                  {showPhotoDropdown && (
                    <div className="absolute top-full mt-2 w-64 bg-white rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <h3 className="font-semibold mb-2">Mes photos</h3>
                        <div className="grid grid-cols-3 gap-2">
                          {previousPhotos.map((photo, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={photo.url}
                                alt={`Previous ${index + 1}`}
                                className="w-full h-16 object-cover rounded cursor-pointer"
                                onClick={() => handleSelectPhoto(photo.url)}
                              />
                              <button
                                onClick={() => handleDeletePhoto(photo.id)}
                                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  {/* User Info */}
                  <div className="flex flex-col space-y-3">
                    <h1 className="text-2xl font-semibold">{user.FirstName} {user.LastName}</h1>
                    <p className="text-gray-600"> email: {user.Email}</p>
                    <p className="text-gray-500"> contact: {user.Phone || 'No phone number'}</p>
                    <p className="text-gray-500"> habite a {user.Residence || 'No address'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">
                Publications ({user.Articles?.length || 0})
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {user.Articles?.map(article => (
                  <div key={article.id} className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={article.imagePath || '/placeholder.jpg'}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">Loading profile...</div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
