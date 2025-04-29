import React, { useState, useEffect, useRef } from 'react';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaBookmark, FaRegBookmark, FaEdit, FaEye, FaTrash } from 'react-icons/fa';
import './ArticleCard.css';
import { API_BASE_URL } from '../services/config';

const ArticleCard = ({ article, onDelete, onEdit }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Stockage des données de l'article avec des valeurs par défaut sécurisées
  const articleData = {
    id: article?.id ?? '',
    title: article?.title ?? 'Sans titre',
    content: article?.content ?? '',
    price: article?.price ?? 0,
    location: article?.location ?? 'Non spécifié',
    description: article?.description ?? '',
    contact: article?.contact ?? 'Non spécifié',
    imagePath: article?.imagePath ?? '',
    authorFirstName: article?.authorFirstName ?? '',
    authorLastName: article?.authorLastName ?? '',
    authorUsername: article?.authorUsername ?? '',
    authorProfilePicture: article?.authorProfilePicture ?? '',
    createdAt: article?.createdAt ? new Date(article.createdAt) : new Date()
  };

  const displayName = articleData.authorFirstName && articleData.authorLastName
    ? `${articleData.authorFirstName} ${articleData.authorLastName}`
    : articleData.authorUsername || 'Utilisateur inconnu';

  console.log('Rendering article:', { id: articleData.id, title: articleData.title, authorFirstName: articleData.authorFirstName, authorLastName: articleData.authorLastName });

  useEffect(() => {
    // Debug log pour vérifier les données reçues
    console.log("Article reçu:", {
      id: articleData.id,
      title: articleData.title,
      content: articleData.content,
      price: articleData.price,
      location: articleData.location,
      imagePath: articleData.imagePath,
      authorFirstName: articleData.authorFirstName,
      authorLastName: articleData.authorLastName,
      authorUsername: articleData.authorUsername,
      authorProfilePicture: articleData.authorProfilePicture
    });
  }, [article]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      setComments([...comments, { text: comment, user: "Utilisateur actuel" }]);
      setComment('');
    }
  };

  const handleEdit = () => {
    try {
      onEdit(articleData); // Notify parent to open the edit form with article data
      setShowDropdown(false);
    } catch (error) {
      console.error('Error in handleEdit:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
      return;
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser?.token) {
        console.error('User not authenticated');
        alert('Vous devez être connecté pour effectuer cette action.');
        return;
      }

      console.log('Deleting article:', article.id);
      const response = await fetch(`${API_BASE_URL}/articles/${article.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la suppression');
      }

      if (typeof onDelete === 'function') {
        onDelete(article.id); // Notify parent to remove the article from the list
      } else {
        console.error('onDelete is not a function');
      }

      alert('Article supprimé avec succès');
      setShowDropdown(false);
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert(error.message || 'Erreur lors de la suppression de l\'article');
    }
  };

  const handleView = () => {
    try {
      alert(`Viewing article: ${articleData.title}`); // Placeholder for view functionality
      setShowDropdown(false);
    } catch (error) {
      console.error('Error in handleView:', error);
    }
  };

  const deleteArticles = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer TOUTES les publications ? Cette action est irréversible.')) {
        return;
    }

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser?.token) {
            console.error('Utilisateur non connecté');
            return;
        }

        const response = await fetch(`${API_BASE_URL}/articles/deleteAll`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Toutes les publications ont été supprimées');
            window.location.reload(); // Rafraîchir la page
        } else {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression des publications');
    }
};

  // Vérification que l'article existe avant le rendu
  if (!article) {
    return null;
  }

  return (
    <div className="article-card">
      {/* En-tête de la carte avec les infos utilisateur */}
      <div className="article-header">
        <div className="user-info">
          <img 
            src={articleData.authorProfilePicture || '/default-avatar.png'} 
            alt={displayName}
            className="user-avatar"
          />
          <div className="user-details">
            <span className="username">{displayName}</span>
            <span className="location">{articleData.location || 'Emplacement non spécifié'}</span>
          </div>
        </div>
        <div className="more-options cursor-poi" ref={dropdownRef}>
          <button onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>•••</button>
          {showDropdown && (
            <div className="dropdown-menu">
              <div className="dropdown-item" onClick={handleView}>
                <FaEye /> Voir
              </div>
              <div className="dropdown-item" onClick={handleEdit}>
                <FaEdit /> Modifier
              </div>
              <div className="dropdown-item delete" onClick={handleDelete}>
                <FaTrash /> Supprimer
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image de l'article */}
      {articleData.imagePath && (
        <div className="article-image">
          <img
            src={articleData.imagePath}
            alt={articleData.title || 'Image article'}
            onError={(e) => e.target.src = '/placeholder.jpg'}
          />
        </div>
      )}

      {/* Barre d'actions */}
      <div className="action-bar">
        <div className="left-actions">
          <button onClick={handleLike} className="action-button">
            {isLiked ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
          </button>
          <button onClick={() => setShowComments(!showComments)} className="action-button">
            <FaComment />
          </button>
          <button className="action-button">
            <FaShare />
          </button>
        </div>
        <button onClick={() => setIsSaved(!isSaved)} className="action-button">
          {isSaved ? <FaBookmark /> : <FaRegBookmark />}
        </button>
      </div>

      {/* Compteur de likes */}
      <div className="likes-count">
        {likes} j'aime
      </div>

      {/* Contenu de l'article */}
      <div className="article-content">
        <h3 className="article-title">{articleData.title}</h3>
        <div className="article-details">
          <p className="article-description">{articleData.description}</p>
          <p className="article-price">
            {articleData.price ? `${new Intl.NumberFormat('fr-FR').format(articleData.price)} Ar` : 'Prix non spécifié'}
          </p>
          <p className="article-contact">{articleData.contact ? `📞 ${articleData.contact}` : 'Contact non spécifié'}</p>
          <p className="article-date">
            {articleData.createdAt ? new Date(articleData.createdAt).toLocaleDateString('fr-FR') : ''}
          </p>
        </div>
      </div>

      {/* Section commentaires */}
      {showComments && (
        <div className="comments-section">
          <div className="comments-list">
            {comments.map((comment, index) => (
              <div key={index} className="comment">
                <span className="comment-username">{comment.user}</span>
                <span className="comment-text">{comment.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Ajouter un commentaire..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-submit">Publier</button>
          </form>
        </div>
      )}
     
    </div>
  );
};

export default ArticleCard;
