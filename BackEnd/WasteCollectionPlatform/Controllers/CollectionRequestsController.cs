using BusinessLogicLayer.DTOs.CollectionRequest;
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
