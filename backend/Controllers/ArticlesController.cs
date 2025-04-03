using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTH.Backend.Data;
using TTH.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ArticlesController> _logger;

        public ArticlesController(AppDbContext context, IWebHostEnvironment environment, ILogger<ArticlesController> logger)
        {
            _context = context;
            _environment = environment;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateArticle([FromForm] ArticleDto articleDto)
        {
            try 
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (userId == null)
                    return Unauthorized(new { message = "User ID not found in token" });

                var article = new Article
                {
                    Title = articleDto.Title,
                    Content = articleDto.Content,
                    Price = articleDto.Price,
                    Location = articleDto.Location,
                    Description = articleDto.Description,
                    Contact = articleDto.Contact,
                    CreatedAt = DateTime.UtcNow,
                    UserId = userId
                };

                if (articleDto.Image != null)
                {
                    var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                    Directory.CreateDirectory(uploadsFolder);

                    var uniqueFileName = Guid.NewGuid().ToString() + "_" + articleDto.Image.FileName;
                    var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                    using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        await articleDto.Image.CopyToAsync(fileStream);
                    }

                    article.ImagePath = $"/uploads/{uniqueFileName}";
                }

                _context.Articles.Add(article);
                await _context.SaveChangesAsync();

                // Return article with complete data
                var response = new
                {
                    message = "Article published successfully",
                    article = new
                    {
                        Id = article.Id,
                        Title = article.Title,
                        Content = article.Content,
                        Price = article.Price,
                        Location = article.Location,
                        Description = article.Description,
                        Contact = article.Contact,
                        CreatedAt = article.CreatedAt,
                        ImagePath = article.ImagePath,
                        Photo = !string.IsNullOrEmpty(article.ImagePath) 
                            ? $"http://localhost:5131{article.ImagePath}"
                            : null
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating article: {ex.Message}");
                return StatusCode(500, new { message = "Error creating article", error = ex.Message });
            }
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<Article>>> GetUserArticles()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var articles = await _context.Articles
                    .Where(a => a.UserId == userId)
                    .OrderByDescending(a => a.CreatedAt)
                    .Select(a => new
                    {
                        id = a.Id,
                        title = a.Title,
                        content = a.Content,
                        description = a.Description,
                        price = a.Price,
                        location = a.Location,
                        contact = a.Contact,
                        createdAt = a.CreatedAt,
                        imagePath = !string.IsNullOrEmpty(a.ImagePath) 
                            ? $"http://localhost:5131{a.ImagePath}"
                            : null
                    })
                    .ToListAsync();

                _logger.LogInformation($"Articles fetched: {JsonSerializer.Serialize(articles)}");
                return Ok(articles);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetUserArticles: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpDelete("reset")]  // Updated route to match frontend
        [Authorize]
        public async Task<IActionResult> DeleteUserArticles()  // Renamed for clarity
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User not found in token" });
                }

                var articles = await _context.Articles
                    .Where(a => a.UserId == userId)
                    .ToListAsync();

                _context.Articles.RemoveRange(articles);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Articles deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting articles: {ex.Message}");
                return StatusCode(500, new { message = "Error deleting articles" });
            }
        }

        [HttpDelete("deleteAll")]
        [Authorize]
        public async Task<IActionResult> DeleteAllArticles()
        {
            try
            {
                // Delete all files in uploads directory
                var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
                if (Directory.Exists(uploadsFolder))
                {
                    foreach (var file in Directory.GetFiles(uploadsFolder))
                    {
                        try
                        {
                            System.IO.File.Delete(file);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning($"Failed to delete file {file}: {ex.Message}");
                        }
                    }
                }

                // Delete all articles from database
                await _context.Database.ExecuteSqlRawAsync("TRUNCATE TABLE \"Articles\" RESTART IDENTITY CASCADE");
                
                return Ok(new { message = "All articles have been deleted" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting all articles: {ex.Message}");
                return StatusCode(500, new { message = "Failed to delete articles", error = ex.Message });
            }
        }

        private string GetUserIdFromToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
                throw new UnauthorizedAccessException("User ID not found in token");
                
            return userIdClaim.Value;
        }
    }

    public class ArticleCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Photo { get; set; }
    }
}
