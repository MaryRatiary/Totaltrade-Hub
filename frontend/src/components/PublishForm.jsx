import React, { useState } from 'react';
import './PublishForm.css';

const PublishForm = ({ onPublish }) => {
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    image: null,
    price: '',
    location: '',
    description: '',
    contact: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArticle({ ...newArticle, [name]: value });
  };

  const handleImageChange = (e) => {
    setNewArticle({ ...newArticle, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();

      // Log the data being sent
      console.log('Données à envoyer:', newArticle);
      
      formData.append('title', newArticle.title);
      formData.append('content', newArticle.content);
      formData.append('price', newArticle.price);
      formData.append('location', newArticle.location);
      formData.append('description', newArticle.description);
      formData.append('contact', newArticle.contact);
      
      if (newArticle.image) {
        formData.append('image', newArticle.image);
      }

      const success = await onPublish(formData);
      
      if (success) {
        setNewArticle({
          title: '',
          content: '',
          image: null,
          price: '',
          location: '',
          description: '',
          contact: ''
        });
        setIsDropdownOpen(false);
        alert('Article publié avec succès!');
      }
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Erreur lors de la publication');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <section className="publish-section">
      <button onClick={toggleDropdown} className="dropdown-toggle !justify-end">
        {isDropdownOpen ? 'abondonner' : 'Publier'} un article
      </button>
      {isDropdownOpen && (
        <form onSubmit={handleSubmit} className="publish-form">
          <input
            type="text"
            name="title"
            placeholder="Titre de l'article"
            value={newArticle.title}
            onChange={handleInputChange}
            className="publish-input"
            required
          />
          <textarea
            name="content"
            placeholder="Contenu de l'article"
            value={newArticle.content}
            onChange={handleInputChange}
            className="publish-input"
            required
          />
          <input
            type="number"
            name="price"
            placeholder="Prix"
            value={newArticle.price || ''}
            onChange={handleInputChange}
            className="publish-input"
            required
          />
          <input
            type="text"
            name="location"
            placeholder="Lieu"
            value={newArticle.location || ''}
            onChange={handleInputChange}
            className="publish-input"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={newArticle.description || ''}
            onChange={handleInputChange}
            className="publish-input"
            required
          />
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={newArticle.contact || ''}
            onChange={handleInputChange}
            className="publish-input"
            required
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="publish-input"
          />
          <button 
            type="submit" 
            className="publish-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publication...' : 'Publier'}
          </button>
        </form>
      )}
    </section>
  );
};

export default PublishForm;
