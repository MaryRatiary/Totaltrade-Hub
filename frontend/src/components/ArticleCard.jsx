import React from 'react';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
  console.log('Full article data:', article);

  if (!article?.Id) return null;

  return (
    <div className="article-card">
      <div className="article-image">
        {(article.ImagePath || article.Photo) && (
          <img
            src={`http://localhost:5131${article.ImagePath || article.Photo}`}
            alt={article.Title}
            onError={(e) => e.target.src = '/placeholder.jpg'}
          />
        )}
      </div>
      <div className="article-content">
        <h3 className="article-title">{article.Title}</h3>
        <div className="article-details">
          {article.Description && (
            <p className="article-description">{article.Description}</p>
          )}
          <p className="article-price">
            {new Intl.NumberFormat('fr-FR').format(article.Price)} Ar
          </p>
          <p className="article-location">📍 {article.Location}</p>
          <p className="article-contact">📞 {article.Contact}</p>
        </div>
        <p className="article-date">
          {article.CreatedAt && (
            `Publié le ${new Date(article.CreatedAt).toLocaleDateString('fr-FR')}`
          )}
        </p>
      </div>
    </div>
  );
};

export default ArticleCard;
