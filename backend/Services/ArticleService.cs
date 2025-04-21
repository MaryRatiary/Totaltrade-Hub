using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MongoDB.Driver.Linq;
using TTH.Backend.Data;
using TTH.Backend.Models;

namespace TTH.Backend.Services
{
    public class ArticleService
    {
        private readonly IMongoCollection<Article> _articles;
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<ArticleService> _logger;

        public ArticleService(
            IOptions<MongoDbSettings> settings,
            IMongoClient mongoClient,
            ILogger<ArticleService> logger)
        {
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _articles = database.GetCollection<Article>(settings.Value.ArticlesCollectionName);
            _users = database.GetCollection<User>(settings.Value.UsersCollectionName);
            _logger = logger;
        }

        public async Task<List<Article>> GetAllAsync()
        {
            try
            {
                _logger.LogInformation("Starting GetAllAsync in ArticleService");
                
                var articles = await _articles.Find(_ => true)
                    .SortByDescending(a => a.CreatedAt)
                    .ToListAsync();
                
                _logger.LogInformation($"Found {articles.Count} articles in database");

                foreach (var article in articles)
                {
                    _logger.LogInformation($"Processing article {article.Id}");
                    var user = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
                    
                    if (user != null)
                    {
                        _logger.LogInformation($"Found author: {user.FirstName} {user.LastName}");
                        article.AuthorFirstName = user.FirstName;
                        article.AuthorLastName = user.LastName;
                        article.AuthorUsername = user.Username;
                        article.AuthorProfilePicture = user.ProfilePicture;
                    }
                    else
                    {
                        _logger.LogWarning($"No author found for article {article.Id}");
                    }
                }

                _logger.LogInformation("Finished processing all articles");
                return articles;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetAllAsync: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                throw;
            }
        }

        public async Task<Article?> GetByIdAsync(string id)
        {
            if (string.IsNullOrEmpty(id))
                return null;
                
            try 
            {
                return await _articles.Find(x => x.Id == id).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting article by ID: {ex}");
                return null;
            }
        }

        public async Task CreateAsync(Article article)
        {
            var user = await _users.Find(u => u.Id == article.UserId).FirstOrDefaultAsync();
            if (user != null)
            {
                article.AuthorFirstName = user.FirstName;
                article.AuthorLastName = user.LastName;
                article.AuthorUsername = user.Username;
                article.AuthorProfilePicture = user.ProfilePicture;
            }
            await _articles.InsertOneAsync(article);
        }

        public async Task UpdateAsync(string id, Article article)
        {
            try
            {
                _logger.LogInformation($"Updating article with ID: {id}");
                await _articles.ReplaceOneAsync(a => a.Id == id, article);
                _logger.LogInformation($"Article with ID {id} updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating article {id}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteAsync(string id)
        {
            try
            {
                _logger.LogInformation($"Attempting to delete article with ID: {id}");
                var result = await _articles.DeleteOneAsync(a => a.Id == id);
                _logger.LogInformation($"Delete result: {result.DeletedCount} document(s) deleted");
                
                if (result.DeletedCount == 0)
                {
                    _logger.LogWarning($"No article found with ID: {id}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting article {id}: {ex.Message}");
                throw;
            }
        }

        public async Task DeleteAllAsync() =>
            await _articles.DeleteManyAsync(Builders<Article>.Filter.Empty);

        public async Task<List<Article>> GetArticlesByUserIdAsync(string userId)
        {
            var articles = await _articles.Find(a => a.UserId == userId)
                                        .SortByDescending(a => a.CreatedAt)
                                        .ToListAsync();

            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user != null)
            {
                foreach (var article in articles)
                {
                    article.AuthorFirstName = user.FirstName;
                    article.AuthorLastName = user.LastName;
                    article.AuthorUsername = user.Username;
                    article.AuthorProfilePicture = user.ProfilePicture;
                }
            }
            return articles;
        }
    }
}
