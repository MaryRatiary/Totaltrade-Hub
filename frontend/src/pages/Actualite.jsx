import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import PublishForm from '../components/PublishForm';
import ArticleCard from '../components/ArticleCard';
import UserList from '../components/UserList';

const Actualite = () => {
  const navigate = useNavigate();
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchArticles();
    fetchUsers();
  }, []);

  const API_BASE_URL = 'http://localhost:5131/api';

  const fetchArticles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/articles/all`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
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
          'Authorization': `Bearer ${currentUser.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to publish article');
      }

      const result = await response.json();
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
        };
        setArticles((prevArticles) => [newArticle, ...prevArticles]);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error publishing article:', error);
      return false;
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
          'Authorization': `Bearer ${currentUser.token}`,
        },
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

  const handleDeleteArticle = (id) => {
    setArticles((prevArticles) => prevArticles.filter((article) => article.id !== id));
  };

  const handleEditArticle = (article) => {
    // Open the PublishForm with the article data pre-filled for editing
    alert(`Editing article: ${article.title}`); // Placeholder for edit functionality
  };

  return (
    <div className={`actualite-container ${isPublishOpen ? 'blur-background' : ''}`}>
      <header>
        <Navbar />
      </header>

      <div className="publish-section-container">
        <PublishForm 
          onPublish={handlePublish} 
          setIsPublishOpen={setIsPublishOpen} 
        />
      </div>

      <div className={`main-content ${isPublishOpen ? 'blur' : ''}`}>
        <div className="admin-controls">
          <button
            onClick={deleteAllArticles}
            className="delete-all-button bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded mb-4"
          >
            Supprimer toutes les publications
          </button>
        </div>

        <Sidebar />
        <UserList users={users} />
        <section className="articles">
          <h2>Publications récentes</h2>
          <div className="articles-grid">
            {articles.length > 0 ? (
              articles.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onDelete={handleDeleteArticle} 
                  onEdit={handleEditArticle} 
                />
              ))
            ) : (
              <p className="no-articles">Aucun article publié pour le moment</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Actualite;



