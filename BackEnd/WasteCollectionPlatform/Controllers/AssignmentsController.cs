using BusinessLogicLayer.DTOs.Assignment;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/assignments")]
    public class AssignmentsController : ControllerBase
    {
        private readonly IAssignmentService _service;

        public AssignmentsController(IAssignmentService service)
        {
            _service = service;
        }

        /// <summary>
        /// Enterprise: Assign collector to request
        /// </summary>
        /// <remarks>
        /// Enterprise assigns a specific collector to handle a collection request.
        /// The request must be in 'Pending' status and the collector must have the 'Collector' role.
        /// </remarks>
        /// <param name="dto">Assignment details including requestId and collectorId</param>
        /// <response code="200">Returns the created assignment details</response>
        /// <response code="400">If the request is not pending, collector is invalid, or business rules violated</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the request doesn't belong to this enterprise or user is not Enterprise role</response>
        /// <response code="404">If the request or collector is not found</response>
        [HttpPost]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AssignCollector([FromBody] AssignCollectorDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var assignment = await _service.AssignCollectorAsync(dto.RequestId, enterpriseId, dto);
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
        /// Enterprise: Reassign different collector
        /// </summary>
        /// <remarks>
        /// Enterprise can reassign a different collector to replace the current one.
        /// Assignment must be in 'Assigned' status (not started yet).
        /// The new collector must be different from the current collector.
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment to reassign</param>
        /// <param name="dto">New collector details including newCollectorId and reason</param>
        /// <response code="200">Returns the updated assignment with new collector</response>
        /// <response code="400">If assignment is not in 'Assigned' status, new collector is same, or invalid</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the assignment doesn't belong to this enterprise</response>
        /// <response code="404">If the assignment or new collector is not found</response>
        [HttpPut("{assignmentId:int}")]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ReassignCollector(int assignmentId, [FromBody] ReassignCollectorDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var assignment = await _service.ReassignCollectorAsync(assignmentId, enterpriseId, dto);
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
        /// Enterprise: Cancel assignment
        /// </summary>
        /// <remarks>
        /// Enterprise can cancel an assignment at any time.
        /// Cancelled assignments set the collection request back to 'Pending' status.
        /// 
        /// Note: Collector should use Decline endpoint (/collections/{id}/decline) to refuse assignments.
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment to cancel</param>
        /// <response code="200">Returns the cancellation confirmation</response>
        /// <response code="400">If the assignment cannot be cancelled</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not authorized to cancel this assignment</response>
        /// <response code="404">If the assignment is not found</response>
        [HttpPut("{assignmentId:int}/cancel")]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> CancelAssignment(int assignmentId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

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

        /// <summary>
        /// Enterprise: Get all my assignments
        /// </summary>
        /// <remarks>
        /// Returns all assignments (across all requests) that were created by this enterprise.
        /// Includes assignment details, collector info, request info, and waste report details.
        /// Shows timeline tracking: AssignedAt, StartedAt, ArrivedAt, CompletedAt.
        /// </remarks>
        /// <response code="200">Returns the list of assignments</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not an Enterprise role</response>
        [HttpGet]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAllMyAssignments()
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var assignments = await _service.GetAllAssignmentsByEnterpriseAsync(enterpriseId);
                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Collector: Get all my assignments
        /// </summary>
        /// <remarks>
        /// Returns all collection tasks assigned to this collector.
        /// Includes enterprise contact info, waste report details, citizen contact, and location.
        /// Shows current status and timeline (AssignedAt, StartedAt, ArrivedAt, CompletedAt).
        /// </remarks>
        /// <response code="200">Returns the list of collector's assignments</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the user is not a Collector role</response>
        [HttpGet("my-assignments")]
        [Authorize(Roles = "Collector")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
        /// Collector: Get assignment details
        /// </summary>
        /// <remarks>
        /// Returns full details of a specific assignment for the collector.
        /// Includes all information needed for collection: location, waste type, contact info, photos.
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment</param>
        /// <response code="200">Returns the assignment details</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the assignment doesn't belong to this collector</response>
        /// <response code="404">If the assignment is not found</response>
        [HttpGet("{assignmentId:int}")]
        [Authorize(Roles = "Collector")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
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
    }
}
