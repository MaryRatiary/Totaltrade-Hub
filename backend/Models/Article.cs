using System.ComponentModel.DataAnnotations;
using TTH.Backend.Models; // Ensure this namespace matches the namespace in User.cs

public class Article
{
    public int Id { get; set; }
    [Required]
    public string Title { get; set; } = string.Empty;
    [Required]
    public string Content { get; set; } = string.Empty;
    [Required]
    public decimal Price { get; set; }
    [Required]
    public string Location { get; set; } = string.Empty;
    [Required]
    public string Description { get; set; } = string.Empty;
    [Required]
    public string Contact { get; set; } = string.Empty;
    public string ImagePath { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty; // Ensure this matches the User.Id type
    public virtual User? User { get; set; } // Reference the User class
}