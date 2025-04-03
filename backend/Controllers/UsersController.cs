using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTH.Backend.Data;
using TTH.Backend.Models;
using System.Text.Json;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<UsersController> _logger;

        public UsersController(AppDbContext context, ILogger<UsersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                _logger.LogInformation("Fetching all users");

                var users = await _context.Users
                    .Select(u => new
                    {
                        u.Id,
                        u.FirstName,
                        u.LastName,
                        u.Email,
                        u.Phone,
                        u.Birthdate,
                        u.Residence,
                        u.FaceImage
                    })
                    .ToListAsync();

                _logger.LogInformation($"Found {users.Count} users");
                return Ok(users);  // Wrap in Ok() response
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching users: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching users", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(string id)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == id);

                if (user == null)
                    return NotFound(new { message = "User not found" });

                return Ok(new
                {
                    user.Id,
                    user.FirstName,
                    user.LastName,
                    user.Email,
                    user.Phone,
                    user.Birthdate,
                    user.Residence,
                    user.FaceImage,
                    user.IsRegistrationComplete
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error fetching user {id}: {ex.Message}");
                return StatusCode(500, new { message = "Error fetching user", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateDto userUpdate)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            user.FirstName = userUpdate.FirstName;
            user.LastName = userUpdate.LastName;
            user.Phone = userUpdate.Phone;
            user.Residence = userUpdate.Residence;

            await _context.SaveChangesAsync();
            return Ok(user);
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
