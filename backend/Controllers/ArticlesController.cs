using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TTH.Backend.Services;
using TTH.Backend.Models;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly ArticleService _articleService;
        private readonly UserService _userService;
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<ArticlesController> _logger;

        public ArticlesController(
            ArticleService articleService,
            UserService userService,
            IWebHostEnvironment environment,
            ILogger<ArticlesController> logger)
        {
            _articleService = articleService;
            _userService = userService;
            _environment = environment;
            _logger = logger;
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllArticles()
        {
            try
            {
                _logger.LogInformation("Starting GetAllArticles request");
                var articles = await _articleService.GetAllAsync();
                _logger.LogInformation($"Retrieved {articles.Count} articles from service");

                var response = articles.Select(a => {
                    _logger.LogInformation($"Processing article ID: {a.Id}");
                    _logger.LogInformation($"Article data: Title={a.Title}, Author={a.AuthorFirstName} {a.AuthorLastName}");
                    return new
                    {
                        id = a.Id,
                        title = a.Title,
                        content = a.Content,
                        price = a.Price,
                        location = a.Location,
                        description = a.Description,
                        contact = a.Contact,
                        imagePath = !string.IsNullOrEmpty(a.ImagePath) 
                            ? $"http://localhost:5131{a.ImagePath}" 
                            : null,
                        authorFirstName = a.AuthorFirstName,
                        authorLastName = a.AuthorLastName,
                        authorUsername = a.AuthorUsername,
                        authorProfilePicture = !string.IsNullOrEmpty(a.AuthorProfilePicture) 
                            ? $"http://localhost:5131{a.AuthorProfilePicture}" 
                            : null,
                        createdAt = a.CreatedAt
                    };
                }).ToList();

                _logger.LogInformation($"Processed response with {response.Count} articles");
                foreach (var item in response)
                {
                    _logger.LogInformation($"Response item: ID={item.id}, Title={item.title}, Author={item.authorFirstName} {item.authorLastName}");
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetAllArticles: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error fetching articles", error = ex.Message });
            }
        }

        [HttpGet("user")]
        [Authorize]
        public async Task<IActionResult> GetUserArticles()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var articles = await _articleService.GetArticlesByUserIdAsync(userId);
                var response = articles.Select(a => new
                {
                    id = a.Id,
                    title = a.Title,
                    content = a.Content,
                    price = a.Price,
                    location = a.Location,
                    description = a.Description,
                    contact = a.Contact,
                    imagePath = !string.IsNullOrEmpty(a.ImagePath) 
                        ? $"http://localhost:5131{a.ImagePath}"
                        : null,
                    createdAt = a.CreatedAt,
                    userId = a.UserId,
                    authorFirstName = a.AuthorFirstName,
                    authorLastName = a.AuthorLastName,
                    authorUsername = a.AuthorUsername,
                    authorProfilePicture = !string.IsNullOrEmpty(a.AuthorProfilePicture) 
                        ? $"http://localhost:5131{a.AuthorProfilePicture}"
                        : null
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetUserArticles: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateArticle([FromForm] ArticleDto articleDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var user = await _userService.GetUserByIdAsync(userId);
                
                if (user == null)
                    return Unauthorized(new { message = "User not found" });

                var article = new Article
                {
                    Title = articleDto.Title,
                    Content = articleDto.Content,
                    Price = articleDto.Price,
                    Location = articleDto.Location,
                    Description = articleDto.Description,
                    Contact = articleDto.Contact,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow
                };

                if (articleDto.Image != null)
                {
                    article.ImagePath = await SaveImageFile(articleDto.Image);
                }

                await _articleService.CreateAsync(article);
                return Ok(new { message = "Article created successfully", article });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error creating article: {ex.Message}");
                return StatusCode(500, new { message = "Error creating article" });
            }
        }

        private async Task<string> SaveImageFile(IFormFile? image)
        {
            if (image == null) return string.Empty;

            var uploadsFolder = Path.Combine(_environment.WebRootPath, "uploads");
            Directory.CreateDirectory(uploadsFolder);
            var uniqueFileName = $"{Guid.NewGuid()}_{image.FileName}";
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await image.CopyToAsync(fileStream);
            }

            return $"/uploads/{uniqueFileName}";
        }

        [HttpDelete("deleteAll")]
        [Authorize]
        public async Task<IActionResult> DeleteAllArticles()
        {
            try
            {
                _logger.LogInformation("Starting DeleteAllArticles request");
                await _articleService.DeleteAllAsync();
                _logger.LogInformation("Successfully deleted all articles");
                return Ok(new { message = "All articles deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting all articles: {ex.Message}");
                return StatusCode(500, new { message = "Error deleting articles" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteArticle(string id)
        {
            try
            {
                _logger.LogInformation($"Attempting to delete article with ID: {id}");
                
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var article = await _articleService.GetByIdAsync(id);

                if (article == null)
                {
                    _logger.LogWarning($"Article {id} not found");
                    return NotFound(new { message = "Article not found" });
                }

                if (article.UserId != userId)
                {
                    _logger.LogWarning($"User {userId} attempted to delete article {id} without permission");
                    return Forbid();
                }

                await _articleService.DeleteAsync(id);
                _logger.LogInformation($"Article {id} deleted successfully");
                
                return Ok(new { message = "Article deleted successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error deleting article: {ex.Message}");
                return StatusCode(500, new { message = "Error deleting article" });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetArticleById(string id)
        {
            try
            {
                _logger.LogInformation($"Fetching article with ID: {id}");
                var article = await _articleService.GetByIdAsync(id);

                if (article == null)
                {
                    _logger.LogWarning($"Article with ID {id} not found");
                    return NotFound(new { message = "Article not found" });
                }

                var response = new
                {
                    id = article.Id,
                    title = article.Title,
                    content = article.Content,
                    price = article.Price,
                    location = article.Location,
                    description = article.Description,
                    contact = article.Contact,
                    imagePath = !string.IsNullOrEmpty(article.ImagePath)
                        ? $"http://localhost:5131{article.ImagePath}"
                        : null,
                    createdAt = article.CreatedAt,
                    authorFirstName = article.AuthorFirstName,
                    authorLastName = article.AuthorLastName,
                    authorUsername = article.AuthorUsername,
                    authorProfilePicture = !string.IsNullOrEmpty(article.AuthorProfilePicture)
                        ? $"http://localhost:5131{article.AuthorProfilePicture}"
                        : null
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching article by ID: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching article" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateArticle(string id, [FromForm] ArticleDto articleDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var article = await _articleService.GetByIdAsync(id);

                if (article == null)
                {
                    _logger.LogWarning($"Article with ID {id} not found");
                    return NotFound(new { message = "Article not found" });
                }

                if (article.UserId != userId)
                {
                    _logger.LogWarning($"User {userId} attempted to update article {id} without permission");
                    return Forbid();
                }

                article.Title = articleDto.Title;
                article.Content = articleDto.Content;
                article.Price = articleDto.Price;
                article.Location = articleDto.Location;
                article.Description = articleDto.Description;
                article.Contact = articleDto.Contact;

                if (articleDto.Image != null)
                {
                    article.ImagePath = await SaveImageFile(articleDto.Image);
                }

                await _articleService.UpdateAsync(id, article);
                return Ok(new { message = "Article updated successfully", article });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating article: {ex.Message}");
                return StatusCode(500, new { message = "Error updating article" });
            }
        }
    }
}

