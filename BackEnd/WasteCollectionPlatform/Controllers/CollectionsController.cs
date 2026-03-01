using BusinessLogicLayer.DTOs.Collection;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/collections")]
    public class CollectionsController : ControllerBase
    {
        private readonly ICollectionService _service;

        public CollectionsController(ICollectionService service)
        {
            _service = service;
        }

        /// <summary>
        /// Collector: Decline assignment (refuse to collect)
        /// </summary>
        [HttpPut("{assignmentId:int}/decline")]
        [Authorize(Roles = "Collector")]
        public async Task<IActionResult> DeclineAssignment(int assignmentId, [FromBody] DeclineAssignmentDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var collectorId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var result = await _service.DeclineAssignmentAsync(assignmentId, collectorId, dto);
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Collector: Start collection (change status to OnTheWay)
        /// </summary>
        [HttpPut("{assignmentId:int}/start")]
        [Authorize(Roles = "Collector")]
        public async Task<IActionResult> StartCollection(int assignmentId)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var collectorId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var result = await _service.StartCollectionAsync(assignmentId, collectorId);
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
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Collector: Mark arrival at location and upload before photo
        /// </summary>
        [HttpPut("{assignmentId:int}/arrived")]
        [Authorize(Roles = "Collector")]
        public async Task<IActionResult> ArrivedAtLocation(int assignmentId, [FromForm] ArrivedAtLocationDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var collectorId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var result = await _service.ArrivedAtLocationAsync(assignmentId, collectorId, dto);
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Collector: Report issue/problem during collection
        /// </summary>
        [HttpPut("{assignmentId:int}/report-issue")]
        [Authorize(Roles = "Collector")]
        public async Task<IActionResult> ReportIssue(int assignmentId, [FromForm] ReportIssueDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var collectorId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var result = await _service.ReportIssueAsync(assignmentId, collectorId, dto);
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }

        /// <summary>
        /// Collector: Complete collection with proof image
        /// </summary>
        [HttpPut("{assignmentId:int}/complete")]
        [Authorize(Roles = "Collector")]
        public async Task<IActionResult> CompleteCollection(int assignmentId, [FromForm] CompleteCollectionDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var collectorId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var result = await _service.CompleteCollectionAsync(assignmentId, collectorId, dto);
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
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new { message = ex.Message });
            }
        }
    }
}
