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
        /// Enterprise: Get all my collection requests
        /// </summary>
        /// <remarks>
        /// Returns a list of all collection requests that belong to the authenticated enterprise user.
        /// Includes request details, waste report info, and current assignment status.
        /// </remarks>
        /// <response code="200">Returns the list of collection requests</response>
        /// <response code="401">If the user is not authenticated or token is invalid</response>
        /// <response code="403">If the user is not an Enterprise role</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpGet]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Enterprise: Get collection request details
        /// </summary>
        /// <remarks>
        /// Returns detailed information including request details, full waste report information, 
        /// and complete assignment history for a specific collection request.
        /// </remarks>
        /// <param name="requestId">The ID of the collection request</param>
        /// <response code="200">Returns the collection request details</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the request doesn't belong to this enterprise</response>
        /// <response code="404">If the collection request is not found</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpGet("{requestId:int}")]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Admin: Get all collection requests in system
        /// </summary>
        /// <remarks>
        /// Returns all collection requests from all enterprises. 
        /// This endpoint is only accessible by Admin users.
        /// </remarks>
        /// <response code="200">Returns the list of all collection requests</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an Admin role</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Enterprise: Get assignment history for a request
        /// </summary>
        /// <remarks>
        /// Returns all assignments (current and past) for a specific collection request.
        /// Shows collector changes, status changes, and timeline.
        /// </remarks>
        /// <param name="requestId">The ID of the collection request</param>
        /// <response code="200">Returns the assignment history</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the request doesn't belong to this enterprise</response>
        /// <response code="404">If the collection request is not found</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpGet("{requestId:int}/assignments")]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
