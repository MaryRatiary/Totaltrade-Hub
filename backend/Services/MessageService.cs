using Microsoft.Extensions.Options;
using MongoDB.Driver;
using TTH.Backend.Data;
using TTH.Backend.Models;

namespace TTH.Backend.Services
{
    public class MessageService
    {
        private readonly IMongoCollection<Message> _messages;

        public MessageService(IOptions<MongoDbSettings> settings, IMongoClient mongoClient)
        {
            var database = mongoClient.GetDatabase(settings.Value.DatabaseName);
            _messages = database.GetCollection<Message>(settings.Value.MessagesCollectionName);
        }

        public async Task<Message> CreateMessageAsync(Message message)
        {
            message.CreatedAt = DateTime.UtcNow;
            await _messages.InsertOneAsync(message);
            return message;
        }

        public async Task<List<Message>> GetMessagesForUserAsync(string userId) =>
            await _messages.Find(m => m.SenderId == userId || m.ReceiverId == userId)
                         .SortByDescending(m => m.CreatedAt)
                         .ToListAsync();

        public async Task<bool> UpdateMessageAsync(Message message)
        {
            var filter = Builders<Message>.Filter.Eq(m => m.Id, message.Id);
            var update = Builders<Message>.Update
                .Set(m => m.IsRead, message.IsRead);

            var result = await _messages.UpdateOneAsync(filter, update);
            return result.ModifiedCount > 0;
        }
    }
}
