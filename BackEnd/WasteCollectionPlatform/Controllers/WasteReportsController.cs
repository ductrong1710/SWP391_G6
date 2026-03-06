using BusinessLogicLayer.DTOs.WasteReport;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/waste-reports")]
    public class WasteReportsController : ControllerBase
    {
        private readonly IWasteReportService _service;

        public WasteReportsController(IWasteReportService service)
        {
            _service = service;
        }

        public class CreateWasteReportForm
        {
            public IFormFile? Image { get; set; }
            public decimal Latitude { get; set; }
            public decimal Longitude { get; set; }
            public string? Description { get; set; }
            public List<int> WasteTypeIds { get; set; } = new List<int>();
        }

        public class UpdateWasteReportForm
        {
            public IFormFile? Image { get; set; }
            public decimal Latitude { get; set; }
            public decimal Longitude { get; set; }
            public string? Description { get; set; }
            public List<int> WasteTypeIds { get; set; } = new List<int>();
        }


        /// <summary>
        /// Citizen/Admin/Enterprise: Get all waste reports
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "Admin,Citizen,Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll()
        {
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isAdmin = string.Equals(roleClaim, "Admin", StringComparison.OrdinalIgnoreCase);
            var isEnterprise = string.Equals(roleClaim, "Enterprise", StringComparison.OrdinalIgnoreCase);

            int? userId = null;

            if (!isAdmin && !isEnterprise)
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var parsedUserId))
                {
                    return Unauthorized(new { message = "Invalid or missing UserId claim" });
                }
                userId = parsedUserId;
            }

            var reports = await _service.GetAllAsync(userId);
            return Ok(reports);
        }

        /// <summary>
        /// Citizen/Admin/Enterprise: Get waste report details
        /// </summary>
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin,Citizen,Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isAdmin = string.Equals(roleClaim, "Admin", StringComparison.OrdinalIgnoreCase);
            var isEnterprise = string.Equals(roleClaim, "Enterprise", StringComparison.OrdinalIgnoreCase);

            int? userId = null;

            if (!isAdmin && !isEnterprise)
            {
                var userIdClaim = User.FindFirst("UserId")?.Value;
                if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var parsedUserId))
                {
                    return Unauthorized(new { message = "Invalid or missing UserId claim" });
                }
                userId = parsedUserId;
            }

            var report = await _service.GetByIdAsync(id, userId);

            if (report == null)
                return NotFound(new { message = "Waste report not found" });

            return Ok(report);
        }


        /// <summary>
        /// Citizen: Create new waste report
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Citizen")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> Create([FromForm] CreateWasteReportForm form)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var imageUrl = await SaveImageAsync(form.Image);

                var dto = new CreateWasteReportDto
                {
                    Image = imageUrl,
                    Latitude = form.Latitude,
                    Longitude = form.Longitude,
                    Description = form.Description,
                    WasteTypeIds = form.WasteTypeIds
                };

                var created = await _service.CreateAsync(userId, dto);
                return CreatedAtAction(nameof(Create), new { id = created.Id }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("Rate limit", StringComparison.OrdinalIgnoreCase))
            {
                return StatusCode(StatusCodes.Status429TooManyRequests, new { message = ex.Message });
            }
        }

        
        /// <summary>
        /// Citizen: Update waste report
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Citizen")]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(int id, [FromForm] UpdateWasteReportForm form)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var imageUrl = await SaveImageAsync(form.Image);

                var dto = new UpdateWasteReportDto
                {
                    Image = imageUrl,
                    Latitude = form.Latitude,
                    Longitude = form.Longitude,
                    Description = form.Description,
                    WasteTypeIds = form.WasteTypeIds
                };

                var updated = await _service.UpdateAsync(id, userId, dto);
                return Ok(updated);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        
        /// <summary>
        /// Citizen: Cancel waste report
        /// </summary>
        [HttpPut("{id:int}/cancel")]
        [Authorize(Roles = "Citizen")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Cancel(int id)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var updated = await _service.CancelAsync(id, userId);
                return Ok(updated);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Enterprise: Accept waste report and create collection request
        /// </summary>
        [HttpPut("{id:int}/accept")]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Accept(int id)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var enterpriseId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                var updated = await _service.AcceptAsync(id, enterpriseId);
                return Ok(updated);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Enterprise: Reject waste report
        /// </summary>
        [HttpPut("{id:int}/reject")]
        [Authorize(Roles = "Enterprise")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Reject(int id)
        {
            try
            {
                var updated = await _service.RejectAsync(id);
                return Ok(updated);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private static async Task<string> SaveImageAsync(IFormFile? image)
        {
            if (image == null || image.Length <= 0)
            {
                return string.Empty;
            }

            var ext = Path.GetExtension(image.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";

            var root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "waste-reports");
            Directory.CreateDirectory(root);

            var fullPath = Path.Combine(root, fileName);
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/uploads/waste-reports/{fileName}";
        }
    }
}
