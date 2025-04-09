using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TTH.Backend.Services;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SettingsController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<SettingsController> _logger;

        public SettingsController(UserService userService, ILogger<SettingsController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] ProfileUpdateDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null) return NotFound();

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.Phone = request.Phone ?? user.Phone;
            user.Residence = request.Residence ?? user.Residence;
            user.ProfilePicture = request.ProfilePicture ?? user.ProfilePicture;

            await _userService.UpdateUserAsync(user);
            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpPut("security")]
        public async Task<IActionResult> UpdateSecurity([FromBody] SecurityUpdateDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null) return NotFound();

            if (request.NewPassword != null)
            {
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                    return BadRequest(new { message = "Current password is incorrect" });

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            }

            await _userService.UpdateUserAsync(user);
            return Ok(new { message = "Security settings updated successfully" });
        }

        [HttpPut("notifications")]
        public async Task<IActionResult> UpdateNotifications([FromBody] NotificationSettingsDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null) return NotFound();

            // Vous devrez ajouter ces propriétés au modèle User
            // user.PushNotifications = request.PushEnabled;
            // user.EmailNotifications = request.EmailEnabled;
            // user.NotificationSounds = request.SoundsEnabled;

            await _userService.UpdateUserAsync(user);
            return Ok(new { message = "Notification settings updated" });
        }

        [HttpPut("appearance")]
        public async Task<IActionResult> UpdateAppearance([FromBody] AppearanceSettingsDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null) return NotFound();

            // Ajoutez ces propriétés au modèle User si nécessaire
            // user.DarkMode = request.DarkMode;
            // user.Theme = request.Theme;
            // user.FontSize = request.FontSize;

            await _userService.UpdateUserAsync(user);
            return Ok(new { message = "Appearance settings updated" });
        }

        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null) return NotFound();

            await _userService.DeleteUserAsync(userId);

            return Ok(new { message = "Account deleted successfully" });
        }
    }

    public class ProfileUpdateDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Phone { get; set; }
        public string? Residence { get; set; }
        public string? ProfilePicture { get; set; }
    }

    public class SecurityUpdateDto
    {
        public string CurrentPassword { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
        public bool TwoFactorEnabled { get; set; }
    }

    public class NotificationSettingsDto
    {
        public bool PushEnabled { get; set; }
        public bool EmailEnabled { get; set; }
        public bool SoundsEnabled { get; set; }
    }

    public class AppearanceSettingsDto
    {
        public bool DarkMode { get; set; }
        public string Theme { get; set; } = "Default";
        public string FontSize { get; set; } = "Medium";
    }
}
