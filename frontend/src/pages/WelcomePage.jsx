import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/config';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PublishForm from '../components/PublishForm';
import ArticleCard from '../components/ArticleCard';
import UserHorizontalScroll from '../components/UserHorizontalScroll';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [friendsArticles, setFriendsArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]); // Nouvel état
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.token) {
      navigate('/login');
      return;
    }
    
    fetchArticles();
    fetchFriendsArticles();
    fetchAllArticles(); // Nouvelle fonction
    fetchUsers();
  }, [navigate]);

  const fetchArticles = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/user`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Articles fetched from server:', data);
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchFriendsArticles = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/friends`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setFriendsArticles(data);
    } catch (error) {
      console.error('Error fetching friends articles:', error);
    }
  };

  const fetchAllArticles = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/all`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const sortedArticles = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllArticles(sortedArticles);
    } catch (error) {
      console.error('Error fetching all articles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser || !currentUser.token) {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handlePublish = async (formData) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.token) {
        navigate('/login');
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to publish article');
      }

      const result = await response.json();
      console.log('Server response:', result);

      if (result.article) {
        const newArticle = {
          id: result.article.id,
          title: result.article.title,
          content: result.article.content,
          description: result.article.description,
          price: result.article.price,
          location: result.article.location,
          contact: result.article.contact,
          imagePath: result.article.imagePath,
          createdAt: result.article.createdAt,
          userId: currentUser.id // Ajouter l'ID de l'utilisateur
        };
        
        setArticles(prevArticles => [newArticle, ...prevArticles]);
        setAllArticles(prevArticles => [newArticle, ...prevArticles]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error publishing article:', error);
      return false;
    }
  };

  const resetArticles = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer toutes vos publications ?')) {
        return;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.token) {
            navigate('/login');
            return;
        }

        console.log('Sending reset request...');

        const response = await fetch(`${API_BASE_URL}/articles/reset`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server error:', errorData);
            throw new Error('Failed to reset articles');
        }

        await fetchArticles();
        await fetchAllArticles();
        alert('Publications réinitialisées avec succès');
    } catch (error) {
        console.error('Error:', error);
        alert('Erreur lors de la réinitialisation des publications');
    }
  };

  const deleteAllArticles = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUTES les publications ? Cette action est irréversible.')) {
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/deleteAll`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (response.ok) {
        setArticles([]);
        setAllArticles([]);
        alert('Toutes les publications ont été supprimées avec succès');
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la suppression des publications');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <PublishForm onPublish={handlePublish} />
        
        <div className="mb-6">
          <UserHorizontalScroll users={users} />
        </div>

        <div className="admin-controls">
          <button 
            onClick={deleteAllArticles}
            className="delete-all-button bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Supprimer toutes les publications
          </button>
        </div>

        <Sidebar />
        
        <section className="articles">
          <h2 className="text-2xl font-bold mb-4">Fil d'actualité</h2>
          <div className="articles-grid">
            {allArticles && allArticles.length > 0 ? (
              allArticles.map((article, index) => (
                <ArticleCard 
                  key={`${article.id || ''}-${index}`} 
                  article={article}
                  isFriendPost={article.userId !== JSON.parse(localStorage.getItem('currentUser'))?.id}
                />
              ))
            ) : (
              <p className="no-articles">Aucune publication disponible</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WelcomePage;
