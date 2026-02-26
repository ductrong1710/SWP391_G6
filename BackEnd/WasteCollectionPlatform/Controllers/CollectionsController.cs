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
        /// Collector: Decline assignment with reason
        /// </summary>
        /// <remarks>
        /// Collector can decline (refuse) an assignment they don't want to accept.
        /// Must provide a reason for declining. Assignment status changes to 'Declined'.
        /// The collection request status reverts to 'Pending' for reassignment.
        /// Can only decline if assignment status is 'Assigned' (not yet started).
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment to decline</param>
        /// <param name="dto">Decline details including reason</param>
        /// <response code="200">Returns the decline confirmation</response>
        /// <response code="400">If assignment is not in 'Assigned' status or missing reason</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the assignment doesn't belong to this collector</response>
        /// <response code="404">If the assignment is not found</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpPut("{assignmentId:int}/decline")]
        [Authorize(Roles = "Collector")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Collector: Start collection (status OnTheWay)
        /// </summary>
        /// <remarks>
        /// Collector marks that they have started heading to the collection location.
        /// Assignment status changes from 'Assigned' to 'OnTheWay'.
        /// Tracks StartedAt timestamp for timeline.
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment to start</param>
        /// <response code="200">Returns start confirmation with location details</response>
        /// <response code="400">If assignment is not in 'Assigned' status</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the assignment doesn't belong to this collector</response>
        /// <response code="404">If the assignment is not found</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpPut("{assignmentId:int}/start")]
        [Authorize(Roles = "Collector")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Collector: Mark arrived and upload before photo
        /// </summary>
        /// <remarks>
        /// Collector marks that they have arrived at the collection location.
        /// Must upload a BEFORE photo showing waste at the site.
        /// Assignment status changes from 'OnTheWay' to 'Arrived'.
        /// Tracks ArrivedAt timestamp and stores BeforeImageUrl.
        /// This is Step 2 of the 3-step collection workflow (Start → Arrived → Complete).
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment</param>
        /// <param name="dto">Arrival details including before photo (required) and optional note</param>
        /// <response code="200">Returns arrival confirmation with photo URL</response>
        /// <response code="400">If assignment is not in 'OnTheWay' status or before photo is missing</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the assignment doesn't belong to this collector</response>
        /// <response code="404">If the assignment is not found</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpPut("{assignmentId:int}/arrived")]
        [Authorize(Roles = "Collector")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Collector: Report issue during collection
        /// </summary>
        /// <remarks>
        /// Collector reports an issue preventing collection completion.
        /// Assignment status changes to 'Issue'. Can report from 'OnTheWay' or 'Arrived' status.
        /// 
        /// Valid Issue Types:
        /// - WasteNotFound: No waste found at location
        /// - WrongAddress: Address is incorrect or doesn't exist
        /// - WasteTypeMismatch: Waste type differs from description
        /// - CitizenUnavailable: Cannot contact citizen, gate locked
        /// - Other: Other problems
        /// 
        /// Proof image is optional but recommended for evidence.
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment</param>
        /// <param name="dto">Issue details including type, description, and optional proof image</param>
        /// <response code="200">Returns issue report confirmation</response>
        /// <response code="400">If status is invalid, issue type is invalid, or description is missing</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the assignment doesn't belong to this collector</response>
        /// <response code="404">If the assignment is not found</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpPut("{assignmentId:int}/report-issue")]
        [Authorize(Roles = "Collector")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
        /// Collector: Complete collection and upload after photo
        /// </summary>
        /// <remarks>
        /// Collector marks collection as completed after waste has been collected.
        /// Must upload an AFTER photo showing the cleaned site.
        /// Assignment status changes from 'Arrived' to 'Completed'.
        /// This is Step 3 of the 3-step collection workflow (Start → Arrived → Complete).
        /// 
        /// Validations:
        /// - Must be in 'Arrived' status (must have called /arrived endpoint first)
        /// - Before photo must exist (uploaded during arrival)
        /// - After photo is required
        /// - Minimum 2 minutes must pass since arrival (time validation)
        /// - Maximum 4 hours warning (still allows completion but logs warning)
        /// 
        /// Creates a CollectionConfirmation record with both before and after photos.
        /// </remarks>
        /// <param name="assignmentId">The ID of the assignment</param>
        /// <param name="dto">Completion details including after photo (required) and optional note</param>
        /// <response code="200">Returns completion confirmation with both photo URLs</response>
        /// <response code="400">If not in 'Arrived' status, after photo missing, or time too short</response>
        /// <response code="401">If the user is not authenticated</response>
        /// <response code="403">If the assignment doesn't belong to this collector</response>
        /// <response code="404">If the assignment is not found</response>
        /// <response code="500">If an internal server error occurs</response>
        [HttpPut("{assignmentId:int}/complete")]
        [Authorize(Roles = "Collector")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
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
