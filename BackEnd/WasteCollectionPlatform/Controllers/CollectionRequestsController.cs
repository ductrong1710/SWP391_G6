using BusinessLogicLayer.DTOs.CollectionRequest;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
        /// Get all assignments for the authenticated Collector
        /// </summary>
        [HttpGet("my-assignments")]
        [Authorize(Roles = "Collector")]
        public async Task<IActionResult> GetMyAssignments()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var collectorId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var assignments = await _service.GetMyAssignmentsAsync(collectorId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get detailed information about a specific assignment
        /// </summary>
        [HttpGet("assignments/{assignmentId:int}")]
        [Authorize(Roles = "Collector")]
        public async Task<IActionResult> GetAssignmentDetail(int assignmentId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var collectorId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var assignment = await _service.GetAssignmentDetailAsync(assignmentId, collectorId);
                if (assignment == null)
                {
                    return NotFound(new { message = "Assignment not found" });
                }
                return Ok(assignment);
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
        /// Enterprise assigns a collector to a collection request
        /// </summary>
        [HttpPost("{requestId:int}/assign")]
        [Authorize(Roles = "Enterprise")]
        public async Task<IActionResult> AssignCollector(int requestId, [FromBody] AssignCollectorDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var assignment = await _service.AssignCollectorAsync(requestId, enterpriseId, dto);
                return Ok(assignment);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Enterprise reassigns a different collector to a collection request
        /// </summary>
        [HttpPut("{requestId:int}/reassign")]
        [Authorize(Roles = "Enterprise")]
        public async Task<IActionResult> ReassignCollector(int requestId, [FromBody] ReassignCollectorDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var assignment = await _service.ReassignCollectorAsync(requestId, enterpriseId, dto);
                return Ok(assignment);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Cancel a collector assignment (Enterprise or Collector can cancel)
        /// </summary>
        [HttpPut("assignments/{assignmentId:int}/cancel")]
        [Authorize(Roles = "Enterprise,Collector")]
        public async Task<IActionResult> CancelAssignment(int assignmentId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            if (string.IsNullOrWhiteSpace(userRole))
            {
                return Unauthorized(new { message = "Invalid or missing Role claim" });
            }

            try
            {
                var result = await _service.CancelAssignmentAsync(assignmentId, userId, userRole);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
