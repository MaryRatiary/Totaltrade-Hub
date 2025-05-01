using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TTH.Backend.Models;
using TTH.Backend.Services;
using TTH.Backend.Models.DTOs;

namespace TTH.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FriendRequestController : ControllerBase
    {
        private readonly FriendRequestService _friendRequestService;
        private readonly UserService _userService;
        private readonly ILogger<FriendRequestController> _logger;

        public FriendRequestController(
            FriendRequestService friendRequestService,
            UserService userService,
            ILogger<FriendRequestController> logger)
        {
            _friendRequestService = friendRequestService;
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendFriendRequest([FromBody] FriendRequestDto request)
        {
            try
            {
                var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(senderId))
                {
                    return Unauthorized();
                }

                // Vérifier si une demande est déjà en attente
                if (await _friendRequestService.HasPendingRequest(senderId, request.ReceiverId))
                {
                    return BadRequest(new { message = "Une demande d'ami est déjà en attente" });
                }

                var sender = await _userService.GetUserByIdAsync(senderId);
                var receiver = await _userService.GetUserByIdAsync(request.ReceiverId);

                if (sender == null || receiver == null)
                {
                    return NotFound(new { message = "Utilisateur non trouvé" });
                }

                var friendRequest = new FriendRequest
                {
                    SenderId = senderId,
                    Sender = sender,
                    ReceiverId = request.ReceiverId,
                    Receiver = receiver,
                    SentAt = DateTime.UtcNow
                };

                await _friendRequestService.CreateRequestAsync(friendRequest);
                return Ok(new { message = "Demande d'ami envoyée" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending friend request: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors de l'envoi de la demande d'ami" });
            }
        }

        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var requests = await _friendRequestService.GetPendingRequestsForUserAsync(userId);
                var response = requests.Select(r => new
                {
                    requestId = r.Id,
                    senderId = r.SenderId,
                    senderName = $"{r.Sender.FirstName} {r.Sender.LastName}",
                    senderUsername = r.Sender.Username,
                    senderProfilePicture = !string.IsNullOrEmpty(r.Sender.ProfilePicture)
                        ? $"http://localhost:5131{r.Sender.ProfilePicture}"
                        : null,
                    sentAt = r.SentAt
                });

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting pending requests: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors de la récupération des demandes d'ami" });
            }
        }

        [HttpPost("{requestId}/accept")]
        public async Task<IActionResult> AcceptRequest(string requestId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _friendRequestService.AcceptRequestAsync(requestId, userId);
                if (!success)
                {
                    return NotFound(new { message = "Demande d'ami non trouvée" });
                }

                return Ok(new { message = "Demande d'ami acceptée" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error accepting friend request: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors de l'acceptation de la demande d'ami" });
            }
        }

        [HttpPost("{requestId}/reject")]
        public async Task<IActionResult> RejectRequest(string requestId)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var success = await _friendRequestService.RejectRequestAsync(requestId, userId);
                if (!success)
                {
                    return NotFound(new { message = "Demande d'ami non trouvée" });
                }

                return Ok(new { message = "Demande d'ami rejetée" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error rejecting friend request: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors du rejet de la demande d'ami" });
            }
        }

        [HttpGet("friends")]
        public async Task<IActionResult> GetFriends()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var friendIds = await _friendRequestService.GetFriendIdsAsync(userId);
                var friends = new List<object>();

                foreach (var friendId in friendIds)
                {
                    var friend = await _userService.GetUserByIdAsync(friendId);
                    if (friend != null)
                    {
                        friends.Add(new
                        {
                            id = friend.Id,
                            username = friend.Username,
                            firstName = friend.FirstName,
                            lastName = friend.LastName,
                            profilePicture = !string.IsNullOrEmpty(friend.ProfilePicture)
                                ? $"http://localhost:5131{friend.ProfilePicture}"
                                : null
                        });
                    }
                }

                return Ok(new { friends, count = friends.Count });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error getting friends list: {ex.Message}");
                return StatusCode(500, new { message = "Erreur lors de la récupération de la liste d'amis" });
            }
        }
    }
}