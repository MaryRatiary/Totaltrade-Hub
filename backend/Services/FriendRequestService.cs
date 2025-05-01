using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TTH.Backend.Data;
using TTH.Backend.Models;

namespace TTH.Backend.Services
{
    public class FriendRequestService
    {
        private readonly IMongoCollection<FriendRequest> _friendRequests;
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<FriendRequestService> _logger;

        public FriendRequestService(
            IOptions<MongoDbSettings> settings,
            IMongoClient mongoClient,
            ILogger<FriendRequestService> logger)
        {
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _friendRequests = database.GetCollection<FriendRequest>(settings.Value.FriendRequestsCollectionName);
            _users = database.GetCollection<User>(settings.Value.UsersCollectionName);
            _logger = logger;
        }

        public async Task<FriendRequest> CreateRequestAsync(FriendRequest request)
        {
            await _friendRequests.InsertOneAsync(request);
            return request;
        }

        public async Task<List<FriendRequest>> GetPendingRequestsForUserAsync(string userId)
        {
            return await _friendRequests
                .Find(r => r.ReceiverId == userId && !r.IsAccepted)
                .ToListAsync();
        }

        public async Task<bool> AcceptRequestAsync(string requestId, string userId)
        {
            var request = await _friendRequests
                .Find(r => r.Id == requestId && r.ReceiverId == userId)
                .FirstOrDefaultAsync();

            if (request == null) return false;

            var update = Builders<FriendRequest>.Update.Set(r => r.IsAccepted, true);
            var result = await _friendRequests.UpdateOneAsync(r => r.Id == requestId, update);

            if (result.ModifiedCount > 0)
            {
                // Mettre à jour la liste d'amis des deux utilisateurs
                var friendsUpdateSender = Builders<User>.Update.AddToSet(u => u.Friends, request.ReceiverId);
                var friendsUpdateReceiver = Builders<User>.Update.AddToSet(u => u.Friends, request.SenderId);

                await _users.UpdateOneAsync(u => u.Id == request.SenderId, friendsUpdateSender);
                await _users.UpdateOneAsync(u => u.Id == request.ReceiverId, friendsUpdateReceiver);

                return true;
            }

            return false;
        }

        public async Task<bool> RejectRequestAsync(string requestId, string userId)
        {
            var result = await _friendRequests.DeleteOneAsync(
                r => r.Id == requestId && r.ReceiverId == userId && !r.IsAccepted);
            return result.DeletedCount > 0;
        }

        public async Task<bool> HasPendingRequest(string senderId, string receiverId)
        {
            return await _friendRequests
                .Find(r => r.SenderId == senderId && r.ReceiverId == receiverId && !r.IsAccepted)
                .AnyAsync();
        }

        public async Task<List<string>> GetFriendIdsAsync(string userId)
        {
            var acceptedRequests = await _friendRequests
                .Find(r => (r.SenderId == userId || r.ReceiverId == userId) && r.IsAccepted)
                .ToListAsync();

            return acceptedRequests
                .Select(r => r.SenderId == userId ? r.ReceiverId : r.SenderId)
                .Distinct()
                .ToList();
        }
    }
}