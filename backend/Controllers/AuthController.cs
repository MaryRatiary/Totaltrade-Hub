using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTH.Backend.Data;
using TTH.Backend.Models;
using System.Text.Json;
using TTH.Backend.Models.DTOs;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<AuthController> _logger;
        private readonly IConfiguration _configuration;

        public AuthController(AppDbContext context, ILogger<AuthController> logger, IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _configuration = configuration;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] UserRegistrationDto registrationDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = new User
                {
                    Email = registrationDto.Email,
                    Username = registrationDto.Username,
                    FirstName = registrationDto.FirstName,
                    LastName = registrationDto.LastName,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(registrationDto.Password),
                    Phone = registrationDto.Phone,
                    Residence = registrationDto.Residence,
                    Birthdate = registrationDto.Birthdate ?? DateTime.UtcNow,
                    FaceImage = registrationDto.FaceImage,
                    IsRegistrationComplete = true
                };

                await _context.Users.AddAsync(user);
                await _context.SaveChangesAsync();
                
                return Ok(new { 
                    message = "User registered successfully",
                    user = new {
                        user.Id,
                        user.Username,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        user.Phone,
                        user.Residence,
                        user.FaceImage,
                        user.Birthdate
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Registration error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred during registration" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto loginDto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginDto.Email);

                if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
                    return Unauthorized(new { message = "Invalid credentials" });

                var token = GenerateJwtToken(user);

                return Ok(new
                {
                    message = "Login successful",
                    token = token,
                    user = new
                    {
                        user.Id,
                        user.Username,
                        user.Email,
                        user.FirstName,
                        user.LastName,
                        user.Phone,
                        user.Birthdate,
                        user.Residence,
                        user.FaceImage
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [HttpPost("complete-registration")]
        public async Task<IActionResult> CompleteRegistration()
        {
            try
            {
                var email = Request.Headers["User-Email"].ToString();
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == email);

                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                user.IsRegistrationComplete = true;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Registration completed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Complete registration error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred during registration completion" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenSecret = _configuration["AppSettings:Token"];
            if (string.IsNullOrEmpty(tokenSecret))
                throw new InvalidOperationException("Token secret is not configured");

            var key = Encoding.UTF8.GetBytes(tokenSecret); // Ensure tokenSecret is not null

            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email)
                },
                expires: DateTime.Now.AddDays(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
