using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TTH.Backend.Models
{
    public class FaceData
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = ObjectId.GenerateNewId().ToString();
        
        [Required]
        public string Image { get; set; } = string.Empty;
        
        public object[] Detections { get; set; } = Array.Empty<object>();
        
        public string UserId { get; set; } = string.Empty;
        
        [BsonIgnore]
        public User? User { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
