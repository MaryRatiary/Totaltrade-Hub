import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PublishForm from '../components/PublishForm';
import ArticleCard from '../components/ArticleCard';
import UserHorizontalScroll from '../components/UserHorizontalScroll';

const WelcomePage = () => {
  const navigate = useNavigate(); // Add this line
  
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
    }
  }, [navigate]);

  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchArticles();
    fetchUsers();
  }, []);

  const API_BASE_URL = 'http://localhost:5131/api';

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
      console.log('Articles fetched from server:', data); // Debug log
      setArticles(data);
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched users from API:", data); // Debug log
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
      console.log('Server response:', result); // Debug log

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
          createdAt: result.article.createdAt
        };
        
        setArticles(prevArticles => [newArticle, ...prevArticles]);
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

        console.log('Sending reset request...'); // Debug log

        const response = await fetch(`${API_BASE_URL}/articles/reset`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server error:', errorData); // Debug log
            throw new Error('Failed to reset articles');
        }

        await fetchArticles(); // Refresh the articles list
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
    <div className="welcome-container">
      <header>
        <Navbar />
      </header>

      <PublishForm onPublish={handlePublish} />
      
      <div className="admin-controls">
        <button 
          onClick={deleteAllArticles}
          className="delete-all-button bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Supprimer toutes les publications
        </button>
      </div>

      <Sidebar />
       {/* Horizontal Scrollable User List */}
              <div className="mb-6">
                <UserHorizontalScroll users={users} />
                console.log("Users passed to UserHorizontalScroll:", users); // Debug log
              </div>
      
      
      <section className="articles">
        <h2>Publications récentes</h2>
        <div className="articles-grid">
          {articles && articles.length > 0 ? (
            articles.map((article, index) => (
              <ArticleCard 
                key={`${article.id || ''}-${index}`} 
                article={article} 
              />
            ))
          ) : (
            <p className="no-articles">Aucun article publié pour le moment</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default WelcomePage;
