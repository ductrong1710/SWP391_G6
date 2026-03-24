using BusinessLogicLayer.DTOs.Feedback;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class FeedbacksController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbacksController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        /// <summary>
        /// Form model for creating feedback with optional image
        /// </summary>
        public class CreateFeedbackForm
        {
            public int ReportId { get; set; }
            public string Content { get; set; } = null!;
            public IFormFile? Image { get; set; }
        }

        /// <summary>
        /// Citizen: Submit feedback for a report (with optional evidence image)
        /// </summary>
        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(FeedbackResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> CreateFeedback([FromForm] CreateFeedbackForm form)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized(new { message = "Invalid or missing UserId claim" });

            try
            {
                var imageUrl = await SaveImageAsync(form.Image);

                var dto = new CreateFeedbackDto
                {
                    ReportId = form.ReportId,
                    Content = form.Content,
                    ImageUrl = string.IsNullOrEmpty(imageUrl) ? null : imageUrl
                };

                var result = await _feedbackService.CreateFeedbackAsync(userId, dto);
                return CreatedAtAction(nameof(CreateFeedback), new { id = result.FeedbackId }, result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Get feedbacks for a specific report
        /// </summary>
        [HttpGet("report/{reportId:int}")]
        [Authorize]
        [ProducesResponseType(typeof(IEnumerable<FeedbackResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetFeedbacksByReport(int reportId)
        {
            var feedbacks = await _feedbackService.GetFeedbacksByReportIdAsync(reportId);
            return Ok(feedbacks);
        }

        /// <summary>
        /// Admin: Get all feedbacks
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(IEnumerable<FeedbackResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllFeedbacks()
        {
            var feedbacks = await _feedbackService.GetAllFeedbacksAsync();
            return Ok(feedbacks);
        }

        /// <summary>
        /// Admin: Get full feedback detail with report, assignment, confirmation context
        /// </summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(FeedbackDetailDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetFeedbackDetail(int id)
        {
            try
            {
                var detail = await _feedbackService.GetFeedbackDetailAsync(id);
                return Ok(detail);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Resolve feedback with actions (revert report, cancel assignment, deactivate collector)
        /// </summary>
        [HttpPut("{id:int}/resolve")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(FeedbackResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ResolveFeedback(int id, [FromBody] ResolveFeedbackDto dto)
        {
            try
            {
                var result = await _feedbackService.ResolveFeedbackAsync(id, dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Admin: Reject feedback (citizen's complaint is invalid)
        /// </summary>
        [HttpPut("{id:int}/reject")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(FeedbackResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RejectFeedback(int id)
        {
            try
            {
                var result = await _feedbackService.RejectFeedbackAsync(id);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Save uploaded image to wwwroot/uploads/feedbacks/
        /// </summary>
        private static async Task<string> SaveImageAsync(IFormFile? image)
        {
            if (image == null || image.Length <= 0)
                return string.Empty;

            var ext = Path.GetExtension(image.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";

            var root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "feedbacks");
            Directory.CreateDirectory(root);

            var fullPath = Path.Combine(root, fileName);
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/uploads/feedbacks/{fileName}";
        }
    }
}
