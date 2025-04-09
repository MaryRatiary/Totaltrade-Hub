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

        public UserService(
            IOptions<MongoDbSettings> settings,
            IMongoClient mongoClient,
            ILogger<UserService> logger)
        {
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _users = database.GetCollection<User>(settings.Value.UsersCollectionName);
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

        public async Task<User?> GetByEmailAsync(string email) =>
            await _users.Find(u => u.Email == email).FirstOrDefaultAsync();

        public async Task CreateAsync(User user)
        {
            user.CreatedAt = DateTime.UtcNow;
            await _users.InsertOneAsync(user);
        }

        public async Task UpdateUserAsync(User user) =>
            await _users.ReplaceOneAsync(x => x.Id == user.Id, user);

        public async Task UpdateAsync(string? id, User user)
        {
            if (string.IsNullOrEmpty(id)) return;
            await _users.ReplaceOneAsync(x => x.Id == id, user);
        }

        public async Task DeleteUserAsync(string id) =>
            await _users.DeleteOneAsync(x => x.Id == id);
    }
}
