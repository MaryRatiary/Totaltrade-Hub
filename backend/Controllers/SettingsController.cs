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
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UserUpdateDto updateDto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "User ID not found in token" });
                }

                var user = await _userService.GetByIdAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }

                user.FirstName = updateDto.FirstName;
                user.LastName = updateDto.LastName;
                user.Phone = updateDto.Phone;
                user.Residence = updateDto.Residence;

                await _userService.UpdateAsync(userId, user);
                return Ok(new { message = "Profil mis à jour avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating profile: {ex}");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour du profil" });
            }
        }

        [HttpPut("security")]
        public async Task<IActionResult> UpdateSecurity([FromBody] SecurityUpdateDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var user = await _userService.GetByIdAsync(userId);
            if (user == null) 
                return NotFound(new { message = "User not found" });

            if (request.NewPassword != null)
            {
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                    return BadRequest(new { message = "Current password is incorrect" });

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            }

            await _userService.UpdateAsync(userId, user);
            return Ok(new { message = "Security settings updated successfully" });
        }

        [HttpPut("notifications")]
        public async Task<IActionResult> UpdateNotifications([FromBody] NotificationSettingsDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var user = await _userService.GetByIdAsync(userId);
            if (user == null) 
                return NotFound(new { message = "User not found" });

            user.PushNotificationsEnabled = request.PushEnabled;
            user.EmailNotificationsEnabled = request.EmailEnabled;
            user.NotificationSoundsEnabled = request.SoundsEnabled;

            await _userService.UpdateAsync(userId, user);
            return Ok(new { message = "Notification settings updated" });
        }

        [HttpPut("appearance")]
        public async Task<IActionResult> UpdateAppearance([FromBody] AppearanceSettingsDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { message = "User not authenticated" });

            var user = await _userService.GetByIdAsync(userId);
            if (user == null) 
                return NotFound(new { message = "User not found" });

            user.DarkModeEnabled = request.DarkMode;
            user.Theme = request.Theme;
            user.FontSize = request.FontSize;

            await _userService.UpdateAsync(userId, user);
            return Ok(new { message = "Appearance settings updated" });
        }

        [HttpDelete("account")]
        public async Task<IActionResult> DeleteAccount()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User ID not found in token" });
            }

            var user = await _userService.GetByIdAsync(userId);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

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
