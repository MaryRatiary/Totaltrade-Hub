using Microsoft.AspNetCore.Mvc;
using TTH.Backend.Services;
using TTH.Backend.Models;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<UsersController> _logger;
        private readonly IWebHostEnvironment _webHostEnvironment;

        public UsersController(UserService userService, ILogger<UsersController> logger, IWebHostEnvironment webHostEnvironment)
        {
            _userService = userService;
            _logger = logger;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet("list")] // Changed from "all" to "list" to avoid conflict
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                _logger.LogInformation("Fetching all users");

                var users = await _userService.GetAllUsersAsync();

                if (users == null || !users.Any())
                {
                    _logger.LogWarning("No users found in the database");
                    return NotFound(new { message = "No users found" });
                }

                _logger.LogInformation($"Found {users.Count} users");
                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching users: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error fetching users", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                _logger.LogInformation($"Getting user details for ID: {id}");

                var user = await _userService.GetUserByIdAsync(id);

                if (user == null)
                {
                    _logger.LogWarning($"User not found for ID: {id}");
                    return NotFound(new { message = "User not found" });
                }

                var response = new
                {
                    id = user.Id,
                    email = user.Email,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    phone = user.Phone ?? "",
                    residence = user.Residence ?? "",
                    profilePicture = !string.IsNullOrEmpty(user.ProfilePicture)
                        ? $"http://localhost:5131{user.ProfilePicture}"
                        : "/default-avatar.png", // Default profile picture if none exists
                    articles = user.Articles.Select(a => new
                    {
                        id = a.Id,
                        title = a.Title,
                        description = a.Description,
                        imagePath = !string.IsNullOrEmpty(a.ImagePath) 
                            ? $"http://localhost:5131{a.ImagePath}"
                            : null,
                        createdAt = a.CreatedAt
                    }).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting user: {ex}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateDto userUpdate)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();

            user.FirstName = userUpdate.FirstName;
            user.LastName = userUpdate.LastName;
            user.Phone = userUpdate.Phone;
            user.Residence = userUpdate.Residence;

            await _userService.UpdateUserAsync(user);
            return Ok(user);
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetUserProfile()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation($"Getting profile for user ID: {userId}");

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var user = await _userService.GetUserByIdAsync(userId);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                var response = new
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Phone = user.Phone,
                    Residence = user.Residence,
                    ProfilePicture = !string.IsNullOrEmpty(user.ProfilePicture) 
                        ? $"http://localhost:5131{user.ProfilePicture}"
                        : null,
                    Articles = user.Articles.Select(a => new
                    {
                        id = a.Id,
                        title = a.Title,
                        description = a.Description,
                        imagePath = !string.IsNullOrEmpty(a.ImagePath) 
                            ? $"http://localhost:5131{a.ImagePath}"
                            : null,
                        createdAt = a.CreatedAt,
                        location = a.Location,
                        price = a.Price,
                        contact = a.Contact
                    }).ToList()
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error in GetUserProfile: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred while fetching the profile" });
            }
        }

        [HttpPost("profile-picture")]
        [Authorize]
        public async Task<IActionResult> UploadProfilePicture([FromForm] IFormFile image)
        {
            try
            {
                _logger.LogInformation("Starting profile picture upload process...");
                
                if (image == null || image.Length == 0)
                {
                    _logger.LogWarning("No file uploaded");
                    return BadRequest(new { message = "No file uploaded" });
                }

                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation($"User ID from token: {userId}");
                
                var user = await _userService.GetUserByIdAsync(userId);
                _logger.LogInformation($"Found user: {user?.Id}, Current profile picture: {user?.ProfilePicture}");

                if (user == null)
                {
                    _logger.LogWarning("User not found in database");
                    return NotFound(new { message = "User not found" });
                }

                var uploadsFolder = Path.Combine(_webHostEnvironment.WebRootPath, "uploads");
                _logger.LogInformation($"Upload folder path: {uploadsFolder}");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);
                var relativePath = $"/uploads/{uniqueFileName}";
                
                _logger.LogInformation($"Saving file to: {filePath}");
                _logger.LogInformation($"Relative path will be: {relativePath}");

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await image.CopyToAsync(fileStream);
                    _logger.LogInformation("File saved successfully");
                }

                // Sauvegarder l'ancien chemin
                var oldPicturePath = user.ProfilePicture;
                _logger.LogInformation($"Old profile picture path: {oldPicturePath}");

                // Mettre à jour le profil
                user.ProfilePicture = relativePath;
                await _userService.UpdateUserAsync(user);
                
                try
                {
                    _logger.LogInformation("Database updated successfully");
                }
                catch (Exception dbEx)
                {
                    _logger.LogError($"Database update failed: {dbEx.Message}");
                    throw;
                }

                // Vérifier la mise à jour
                var updatedUser = await _userService.GetUserByIdAsync(userId);
                _logger.LogInformation($"Verification - Updated profile picture: {updatedUser?.ProfilePicture}");

                // Supprimer l'ancienne photo
                if (!string.IsNullOrEmpty(oldPicturePath))
                {
                    var oldFilePath = Path.Combine(_webHostEnvironment.WebRootPath, oldPicturePath.TrimStart('/'));
                    _logger.LogInformation($"Attempting to delete old file: {oldFilePath}");
                    
                    if (System.IO.File.Exists(oldFilePath))
                    {
                        System.IO.File.Delete(oldFilePath);
                        _logger.LogInformation("Old file deleted successfully");
                    }
                }

                _logger.LogInformation("Profile picture update completed successfully");
                return Ok(new { 
                    message = "Profile picture updated successfully",
                    profilePictureUrl = $"http://localhost:5131{relativePath}",
                    debugInfo = new {
                        userId,
                        oldPath = oldPicturePath,
                        newPath = relativePath,
                        fullUrl = $"http://localhost:5131{relativePath}"
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Profile picture update failed: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { 
                    message = "Error uploading profile picture",
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }

    public class UserUpdateDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Residence { get; set; }
    }
}
