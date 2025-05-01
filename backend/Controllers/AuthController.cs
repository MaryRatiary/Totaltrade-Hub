using Microsoft.AspNetCore.Mvc;
using TTH.Backend.Models;
using TTH.Backend.Models.DTOs;
using TTH.Backend.Models.DTOs.Auth;  // This is the namespace we want to use
using TTH.Backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BC = BCrypt.Net.BCrypt;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserService userService,
            IConfiguration configuration,
            ILogger<AuthController> logger)
        {
            _userService = userService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register([FromBody] UserRegistrationDto request)
        {
            var user = await _userService.GetByEmailAsync(request.Email);
            if (user != null)
            {
                return BadRequest(new { message = "User already exists" });
            }

            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var newUser = new User
                {
                    Email = request.Email,
                    Username = request.Username,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    PasswordHash = BC.HashPassword(request.Password),
                    Phone = request.Phone,
                    Residence = request.Residence,
                    Birthdate = request.Birthdate ?? DateTime.UtcNow,
                    FaceImage = request.FaceImage,
                    IsRegistrationComplete = true
                };

                await _userService.CreateAsync(newUser);
                
                var token = GenerateJwtToken(newUser);
                
                return Ok(new { 
                    message = "User registered successfully",
                    token = token,
                    user = new {
                        id = newUser.Id,
                        username = newUser.Username,
                        email = newUser.Email,
                        firstName = newUser.FirstName,
                        lastName = newUser.LastName,
                        phone = newUser.Phone,
                        residence = newUser.Residence,
                        faceImage = newUser.FaceImage,
                        birthdate = newUser.Birthdate
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
            _logger.LogInformation($"Login attempt for email: {loginDto.Email}");
            
            try
            {
                if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
                {
                    return BadRequest(new { message = "Email et mot de passe requis" });
                }

                var user = await _userService.GetByEmailAsync(loginDto.Email);

                if (user == null)
                {
                    _logger.LogWarning($"Login failed: User not found for email {loginDto.Email}");
                    return Unauthorized(new { message = "Email ou mot de passe invalide" });
                }

                if (!BC.Verify(loginDto.Password, user.PasswordHash))
                {
                    _logger.LogWarning($"Login failed: Invalid password for email {loginDto.Email}");
                    return Unauthorized(new { message = "Email ou mot de passe invalide" });
                }

                var token = GenerateJwtToken(user);

                _logger.LogInformation($"Login successful for user {user.Id}");

                return Ok(new
                {
                    message = "Connexion réussie",
                    token = token,
                    user = new
                    {
                        id = user.Id,
                        username = user.Username,
                        email = user.Email,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        phone = user.Phone,
                        birthdate = user.Birthdate,
                        residence = user.Residence,
                        profilePicture = user.ProfilePicture
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Login error: {ex}");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la connexion" });
            }
        }

        [HttpPost("complete-registration")]
        public async Task<IActionResult> CompleteRegistration()
        {
            try
            {
                var email = Request.Headers["User-Email"].ToString();
                if (string.IsNullOrEmpty(email))
                {
                    return BadRequest(new { message = "Email is required" });
                }

                var user = await _userService.GetByEmailAsync(email);
                if (user == null)
                {
                    return NotFound(new { message = "User not found" });
                }

                if (string.IsNullOrEmpty(user.Id))
                {
                    return StatusCode(500, new { message = "Invalid user ID" });
                }

                user.IsRegistrationComplete = true;
                await _userService.UpdateAsync(user.Id, user);

                return Ok(new { message = "Registration completed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Complete registration error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred during registration completion" });
            }
        }

        [HttpPost("signout")]
        [Authorize]
        public IActionResult Logout()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                _logger.LogInformation($"User {userId} logging out");

                // Vous pouvez ajouter ici la logique pour invalider le token si nécessaire
                
                return Ok(new { message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Logout error: {ex.Message}");
                return StatusCode(500, new { message = "An error occurred during logout" });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenSecret = _configuration["AppSettings:Token"];
            if (string.IsNullOrEmpty(tokenSecret))
                throw new InvalidOperationException("Token secret is not configured");

            if (string.IsNullOrEmpty(user.Id))
                throw new InvalidOperationException("User ID is required");

            var key = Encoding.UTF8.GetBytes(tokenSecret);
            var creds = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha512Signature);

            var token = new JwtSecurityToken(
                claims: new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id),
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
