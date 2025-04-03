import React, { useState } from 'react';

const ArticleList = ({ articles, handleEdit, handleDelete }) => {
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  return (
    <div className="articles-section">
      {articles.map((article) => (
        <div key={article.id} className="article-card">
          <div className="article-header">
            <button className="dropdown-toggle" onClick={() => toggleDropdown(article.id)}>...</button>
            {dropdownOpen === article.id && (
              <div className="dropdown-menu">
                <button onClick={() => handleEdit(article.id)}>Edit</button>
                <button onClick={() => handleDelete(article.id)}>Delete</button>
              </div>
            )}
          </div>
          {article.photo ? (
            <img src={article.photo} alt="Article" className="article-image" style={{ width: '450px', height: '450px' }} />
          ) : (
            <p>No image available</p>
          )}
          <div className="article-details">
            <h3>{article.description}</h3>
            <p>Prix: {article.price} Ariary</p>
            <p>Lieu: {article.location}</p>
            <p>Contact: {article.contact}</p>
            <p>Publié le: {new Date(article.createdAt).toLocaleString()}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleList;
