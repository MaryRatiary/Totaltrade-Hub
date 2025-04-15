import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { API_BASE_URL } from '../services/config';
import { FaHeart, FaTimes, FaUndo, FaStar } from 'react-icons/fa';
import './EJeryPage.css';

const EJeryPage = () => {
  const [articles, setArticles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/articles/all`, {
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches ? e.touches[0].clientX : e.clientX);
  };

  const handleDragMove = (e) => {
    if (!isDragging) return;
    const currentX = e.touches ? e.touches[0].clientX : e.clientX;
    const diff = currentX - startX;
    setOffsetX(diff);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    if (Math.abs(offsetX) > 100) {
      if (offsetX > 0) {
        handleLike();
      } else {
        handleDislike();
      }
    }
    setOffsetX(0);
  };

  const handleLike = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleDislike = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSuperLike = () => {
    if (currentIndex < articles.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  return (
    <div className="ejery-page">
      <Navbar />
      <div className="cards-container">
        {articles.length > 0 && currentIndex < articles.length ? (
          <div 
            className="card"
            style={{
              transform: `translateX(${offsetX}px) rotate(${offsetX * 0.1}deg)`,
              transition: isDragging ? 'none' : 'transform 0.3s ease'
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            <img 
              src={articles[currentIndex].imagePath || '/default-post.jpg'} 
              alt="Post" 
              className="card-image"
            />
            <div className="card-info">
              <h2>{articles[currentIndex].title}</h2>
              <p>{articles[currentIndex].description}</p>
              <div className="price-location">
                <span className="price">{articles[currentIndex].price} Ar</span>
                <span className="location">{articles[currentIndex].location}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-more-cards">
            <h2>Plus aucun article disponible</h2>
            <p>Revenez plus tard pour voir de nouveaux articles</p>
          </div>
        )}
        
        <div className="action-buttons">
          <button className="action-button undo" onClick={handleUndo}>
            <FaUndo />
          </button>
          <button className="action-button dislike" onClick={handleDislike}>
            <FaTimes />
          </button>
          <button className="action-button superlike" onClick={handleSuperLike}>
            <FaStar />
          </button>
          <button className="action-button like" onClick={handleLike}>
            <FaHeart />
          </button>
        </div>
      </div>
    </div>
  );
};

export default EJeryPage;