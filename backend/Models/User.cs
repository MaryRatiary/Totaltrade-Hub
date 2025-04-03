using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace TTH.Backend.Models // Ensure this namespace matches the one imported in Article.cs
{
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string? ProfilePicture { get; set; }
        public string? Phone { get; set; }
        public string? Residence { get; set; }
        public DateTime Birthdate { get; set; }
        public bool IsRegistrationComplete { get; set; }
        public string? Password { get; set; } // Temporaire pour l'authentification
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public virtual ICollection<Article> Articles { get; set; } = new List<Article>();

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public string? FaceImage { get; set; } // Anciennement dans FaceData
    }
}
