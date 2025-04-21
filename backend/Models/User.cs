using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TTH.Backend.Models // Ensure this namespace matches the one imported in Article.cs
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonRequired]
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string ProfilePicture { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Residence { get; set; }
        public DateTime Birthdate { get; set; }
        public bool IsRegistrationComplete { get; set; }
        public string? Password { get; set; } // Temporaire pour l'authentification
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public FaceData? FaceData { get; set; }

        [BsonIgnore]
        public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

        public string? FaceImage { get; set; } // Anciennement dans FaceData

        // Notification Settings
        public bool PushNotificationsEnabled { get; set; } = true;
        public bool EmailNotificationsEnabled { get; set; } = true;
        public bool NotificationSoundsEnabled { get; set; } = true;

        // Appearance Settings
        public bool DarkModeEnabled { get; set; } = false;
        public string Theme { get; set; } = "Default";
        public string FontSize { get; set; } = "Medium";

        // Security Settings
        public bool TwoFactorEnabled { get; set; } = false;
        public DateTime? LastPasswordChange { get; set; }

        // Messaging System
        public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

        // Friend Request System
        public virtual ICollection<FriendRequest> SentFriendRequests { get; set; } = new List<FriendRequest>();
        public virtual ICollection<FriendRequest> ReceivedFriendRequests { get; set; } = new List<FriendRequest>();

        public List<string> Friends { get; set; } = new List<string>();

        public bool ValidatePassword(string inputPassword)
        {
            // Compares the input password with the stored hashed password
            return BCrypt.Net.BCrypt.Verify(inputPassword, PasswordHash);
        }

        public void HashPassword()
        {
            if (!string.IsNullOrEmpty(Password))
            {
                // Hashes the plaintext password and clears it for security
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(Password);
                Password = null; // Clear plaintext password after hashing
            }
        }
    }
}
