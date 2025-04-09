using Microsoft.AspNetCore.Mvc;
using TTH.Backend.Models;
using TTH.Backend.Models.DTOs;
using TTH.Backend.Services;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(UserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPost("send-message")]
        public async Task<IActionResult> SendMessage([FromBody] MessageDto messageDto)
        {
            var sender = await _userService.GetUserByIdAsync(messageDto.SenderId);
            var receiver = await _userService.GetUserByIdAsync(messageDto.ReceiverId);

            if (sender == null || receiver == null)
                return NotFound("Sender or receiver not found.");

            // TODO: Implement message collection in MongoDB
            return Ok("Message sent successfully.");
        }

        [HttpPost("send-friend-request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto friendRequestDto)
        {
            var sender = await _userService.GetUserByIdAsync(friendRequestDto.SenderId);
            var receiver = await _userService.GetUserByIdAsync(friendRequestDto.ReceiverId);

            if (sender == null || receiver == null)
                return NotFound("Sender or receiver not found.");

            // TODO: Implement friend request collection in MongoDB
            return Ok("Friend request sent successfully.");
        }
    }
}
