using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/collection-requests")]
    public class CollectionRequestsController : ControllerBase
    {
        private readonly ICollectionRequestService _service;

        public CollectionRequestsController(ICollectionRequestService service)
        {
            _service = service;
        }

        /// <summary>
        /// Get all collection requests for the authenticated Enterprise
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Enterprise")]
        public async Task<IActionResult> GetMyCollectionRequests()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var requests = await _service.GetCollectionRequestsByEnterpriseAsync(enterpriseId);
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed information about a specific collection request
        /// </summary>
        [HttpGet("{requestId:int}")]
        [Authorize(Roles = "Enterprise")]
        public async Task<IActionResult> GetCollectionRequestDetail(int requestId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var request = await _service.GetCollectionRequestDetailAsync(requestId, enterpriseId);
                if (request == null)
                {
                    return NotFound(new { message = "Collection request not found" });
                }
                return Ok(request);
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Get all collection requests in the system
        /// </summary>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllCollectionRequests()
        {
            try
            {
                var requests = await _service.GetAllCollectionRequestsAsync();
                return Ok(requests);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Enterprise: Get assignment history for a specific collection request
        /// </summary>
        [HttpGet("{requestId:int}/assignments")]
        [Authorize(Roles = "Enterprise")]
        public async Task<IActionResult> GetAssignmentHistory(int requestId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var history = await _service.GetAssignmentHistoryByRequestAsync(requestId, enterpriseId);
                return Ok(history);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
