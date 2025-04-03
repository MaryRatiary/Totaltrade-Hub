using System.ComponentModel.DataAnnotations;

public class ArticleDto
{
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

    public IFormFile? Image { get; set; } // Nullable to avoid warnings
}
