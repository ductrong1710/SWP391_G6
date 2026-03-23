using BusinessLogicLayer.DTOs.Reward;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/rewards")]
    [Authorize]
    public class RewardsController : ControllerBase
    {
        private readonly IRewardService _rewardService;

        public RewardsController(IRewardService rewardService)
        {
            _rewardService = rewardService;
        }

        /// <summary>
        /// Get all active voucher rewards
        /// </summary>
        [HttpGet("catalog")]
        [Authorize(Roles = "Citizen")]
        public async Task<IActionResult> GetRewardCatalog()
        {
            var rewards = await _rewardService.GetAvailableRewardsAsync();
            return Ok(rewards);
        }

        /// <summary>
        /// Get the total available points of the logged-in user
        /// </summary>
        [HttpGet("balance")]
        public async Task<IActionResult> GetMyBalance()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var points = await _rewardService.GetUserTotalPointsAsync(userId);
            return Ok(new { TotalPoints = points });
        }

        /// <summary>
        /// Get reward transaction history (points earned/spent)
        /// </summary>
        [HttpGet("history")]
        public async Task<IActionResult> GetMyTransactionHistory()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            var history = await _rewardService.GetUserTransactionHistoryAsync(userId);
            return Ok(history);
        }

        /// <summary>
        /// Redeem a voucher using reward points
        /// </summary>
        [HttpPost("redeem")]
        [Authorize(Roles = "Citizen")]
        public async Task<IActionResult> RedeemReward([FromBody] RedeemRewardRequestDto request)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized();
            }

            try
            {
                var result = await _rewardService.RedeemRewardAsync(userId, request);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}