import React, { useState, useEffect } from 'react';
import ArticleCard from './ArticleCard';

const NewsFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('http://localhost:5131/api/articles/all');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        console.log('Raw API response:', data);

        if (!Array.isArray(data)) {
          console.error('Expected array of articles, got:', typeof data);
          setArticles([]);
          return;
        }

        const validArticles = data.map(article => ({
          id: article.id,
          title: article.title,
          content: article.content,
          price: article.price,
          location: article.location,
          description: article.description,
          contact: article.contact,
          imagePath: article.imagePath,
          authorFirstName: article.authorFirstName,
          authorLastName: article.authorLastName,
          authorUsername: article.authorUsername,
          authorProfilePicture: article.authorProfilePicture,
          createdAt: article.createdAt
        }));

        console.log('Processed articles:', validArticles);
        setArticles(validArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) return <div>Chargement des articles...</div>;
  if (error) return <div>Erreur: {error}</div>;
  if (!articles.length) return <div>Aucun article disponible</div>;

  return (
    <div className="news-feed">
      {articles.map((article) => (
        <ArticleCard 
          key={article.id} 
          article={article}
        />
      ))}
    </div>
  );
};

export default NewsFeed;
