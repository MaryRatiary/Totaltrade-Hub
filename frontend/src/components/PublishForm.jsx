import React, { useState, useCallback } from 'react';
import './PublishForm.css';

const PublishForm = ({ onPublish }) => {
  const [newArticle, setNewArticle] = useState({
    title: '',
    content: '',
    image: null,
    imagePreview: null,
    price: '',
    location: '',
    description: '',
    contact: '',
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArticle({ ...newArticle, [name]: value });
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleImageDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setNewArticle((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewArticle((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const removeImage = () => {
    URL.revokeObjectURL(newArticle.imagePreview);
    setNewArticle((prev) => ({
      ...prev,
      image: null,
      imagePreview: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();

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
          imagePreview: null,
          price: '',
          location: '',
          description: '',
          contact: '',
        });
        setIsDropdownOpen(false); // Close the dropdown
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
    setIsDropdownOpen(!isDropdownOpen); // Toggle the dropdown state
  };

  return (
    <section className="publish-section">
      <button onClick={toggleDropdown} className="dropdown-toggle">
        {isDropdownOpen ? 'Abandonner' : 'Publier un article'}
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
          <input
            type="text"
            name="contact"
            placeholder="Contact"
            value={newArticle.contact || ''}
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
          <textarea
            name="description"
            placeholder="Description"
            value={newArticle.description || ''}
            onChange={handleInputChange}
            className="publish-input"
            required
          />

          <div
            className={`image-drop-zone ${isDragging ? 'drag-active' : ''}`}
            onDrop={handleImageDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            {newArticle.imagePreview ? (
              <div className="image-preview-container">
                <img
                  src={newArticle.imagePreview}
                  alt="Prévisualisation"
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage();
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <div className="plus-icon">+</div>
                <p>Glissez une image ici ou cliquez pour sélectionner</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>

          <div className="!justify-end">
            <button
              type="submit"
              className="publish-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Publication...' : 'Publier'}
            </button>
          </div>
        </form>
      )}
    </section>
  );
};

export default PublishForm;
