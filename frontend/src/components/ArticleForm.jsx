import React from 'react';

const ArticleForm = ({ isDropdownOpen, setIsDropdownOpen, article, handleInputChange, handleImageDrop, handleSubmit }) => {
  return (
    <div className="publish-section">
      <input type="text" placeholder="What's on your mind?" className="publish-input" />
      <button className="publish-button" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
        {isDropdownOpen ? '-' : '+'}
      </button>
      {isDropdownOpen && (
        <div className="dropdown-form elevate clear-content">
          <form onSubmit={handleSubmit}>
            <div className="mosaic-grid">
              <input
                type="text"
                name="title"
                placeholder="Titre"
                value={article.title}
                onChange={handleInputChange}
                className="dropdown-input"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Prix en Ariary"
                value={article.price}
                onChange={handleInputChange}
                className="dropdown-input"
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={article.description}
                onChange={handleInputChange}
                className="dropdown-input"
              />
              <input
                type="text"
                name="location"
                placeholder="Lieu"
                value={article.location}
                onChange={handleInputChange}
                className="dropdown-input"
              />
              <input
                type="text"
                name="contact"
                placeholder="Contact du vendeur"
                value={article.contact}
                onChange={handleInputChange}
                className="dropdown-input"
              />
              <div
                className="image-dropzone"
                onDrop={handleImageDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {article.photo ? (
                  <img src={article.photo} alt="Article" className="image-preview" style={{ maxWidth: '400px', maxHeight: '400px' }} />
                ) : (
                  <p>Glissez et déposez une image ici</p>
                )}
              </div>
            </div>
            <button type="submit" className="submit-button">Publier</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ArticleForm;
