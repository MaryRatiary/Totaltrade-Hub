using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TTH.Backend.Data;
using TTH.Backend.Models;

namespace TTH.Backend.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<UserService> _logger;

        public UserService(IMongoClient mongoClient, IConfiguration config, ILogger<UserService> logger)
        {
            var database = mongoClient.GetDatabase(config.GetSection("MongoDb:DatabaseName").Value);
            _users = database.GetCollection<User>("Users");
            _logger = logger;
        }

        public async Task<List<User>> GetAllUsersAsync() =>
            await _users.Find(_ => true).ToListAsync();

        public Task<List<User>> GetAllAsync() => GetAllUsersAsync();

        public async Task<User?> GetByIdAsync(string? id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            return await GetUserByIdAsync(id);
        }

        public async Task<User?> GetUserByIdAsync(string? id)
        {
            if (string.IsNullOrEmpty(id)) return null;
            return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            try
            {
                var user = await _users.Find(x => x.Email == email).FirstOrDefaultAsync();
                return user;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user by email: {ex}");
                throw new Exception("Une erreur est survenue lors de la récupération de l'utilisateur", ex);
            }
        }

        public async Task<User> CreateAsync(User user)
        {
            try
            {
                await _users.InsertOneAsync(user);
                return user;
            }
            catch (MongoWriteException ex) when (ex.WriteError.Category == ServerErrorCategory.DuplicateKey)
            {
                _logger.LogError($"Duplicate key error creating user: {ex}");
                throw new Exception("Un utilisateur avec cet email existe déjà", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating user: {ex}");
                throw new Exception("Une erreur est survenue lors de la création de l'utilisateur", ex);
            }
        }

        public async Task UpdateAsync(string id, User userIn)
        {
            try
            {
                var result = await _users.ReplaceOneAsync(user => user.Id == id, userIn);
                if (result.ModifiedCount == 0)
                {
                    throw new Exception("Utilisateur non trouvé");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating user: {ex}");
                throw new Exception("Une erreur est survenue lors de la mise à jour de l'utilisateur", ex);
            }
        }

        public async Task DeleteUserAsync(string id) =>
            await _users.DeleteOneAsync(x => x.Id == id);

        public async Task InitializeIndexesAsync()
        {
            try
            {
                var indexKeysDefinition = Builders<User>.IndexKeys.Ascending(user => user.Email);
                var indexOptions = new CreateIndexOptions { Unique = true };
                var indexModel = new CreateIndexModel<User>(indexKeysDefinition, indexOptions);
                
                await _users.Indexes.CreateOneAsync(indexModel);
                _logger.LogInformation("MongoDB indexes initialized successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error initializing MongoDB indexes: {ex}");
                throw;
            }
        }
    }
}
