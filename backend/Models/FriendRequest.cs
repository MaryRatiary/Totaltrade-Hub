using System;
using System.ComponentModel.DataAnnotations;

namespace TTH.Backend.Models
{
    public class FriendRequest
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public string SenderId { get; set; } = string.Empty;
        
        [Required]
        public User Sender { get; set; } = null!;
        
        [Required]
        public string ReceiverId { get; set; } = string.Empty;
        
        [Required]
        public User Receiver { get; set; } = null!;
        
        public bool IsAccepted { get; set; } = false;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
