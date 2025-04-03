using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TTH.Backend.Data;
using TTH.Backend.Models;
using System.Text.Json;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FaceController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<FaceController> _logger;

        public FaceController(AppDbContext context, ILogger<FaceController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFace([FromBody] FaceUploadDto dto)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == dto.UserId.ToString()); // Ensure userId is a string

                if (user == null)
                    return NotFound(new { message = "User not found" });

                user.FaceImage = dto.Image;
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Face data uploaded successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error uploading face data: {ex.Message}");
                return StatusCode(500, new { message = "Error uploading face data" });
            }
        }

        [HttpPost("face-data")]
        public async Task<IActionResult> SaveFaceData([FromBody] FaceDetectionDto dto)
        {
            try
            {
                var user = await _context.Users.FindAsync(dto.UserId.ToString()); // Ensure userId is a string
                if (user == null)
                    return NotFound(new { message = "User not found" });

                user.FaceImage = dto.ImageData;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Face data saved successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error saving face data: {ex.Message}");
                return StatusCode(500, new { message = "Error saving face data" });
            }
        }
    }

    public class FaceUploadDto
    {
        public int UserId { get; set; }
        public string Image { get; set; } = string.Empty;
    }

    public class FaceDetectionDto
    {
        public int UserId { get; set; }
        public string ImageData { get; set; } = string.Empty;
        public object[] Detections { get; set; } = Array.Empty<object>();
    }
}
