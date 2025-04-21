using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TTH.Backend.Services;
using TTH.Backend.Models;
using System.Text.Json;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaceController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<FaceController> _logger;

        public FaceController(UserService userService, ILogger<FaceController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("upload")]
        [Authorize]
        public async Task<IActionResult> UploadFaceData([FromBody] FaceDataDto faceData)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Non autorisé" });

                var user = await _userService.GetByIdAsync(userId);

                if (user == null)
                    return NotFound(new { message = "Utilisateur non trouvé" });

                user.FaceData = new FaceData
                {
                    Image = faceData.ImageData,
                    Detections = faceData.Detections
                };

                await _userService.UpdateAsync(userId, user);

                return Ok(new { message = "Données faciales enregistrées avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading face data: {ex}");
                return StatusCode(500, new { message = "Une erreur est survenue lors de l'enregistrement des données faciales" });
            }
        }

        [HttpPut("update")]
        [Authorize]
        public async Task<IActionResult> UpdateFaceData([FromBody] FaceDataDto faceData)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "Non autorisé" });

                var user = await _userService.GetByIdAsync(userId);

                if (user == null)
                    return NotFound(new { message = "Utilisateur non trouvé" });

                user.FaceData = new FaceData
                {
                    Image = faceData.ImageData,
                    Detections = faceData.Detections
                };

                await _userService.UpdateAsync(userId, user);

                return Ok(new { message = "Données faciales mises à jour avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error updating face data: {ex}");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la mise à jour des données faciales" });
            }
        }
    }

    public class FaceDataDto
    {
        public string ImageData { get; set; } = string.Empty;
        public object[] Detections { get; set; } = Array.Empty<object>();
    }
}
