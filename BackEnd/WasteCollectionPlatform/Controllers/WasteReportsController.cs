using BusinessLogicLayer.DTOs.WasteReport;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/waste-reports")]
    public class WasteReportsController : ControllerBase
    {
        private const string CitizenRoleId = "1";
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
            public int WasteTypeId { get; set; }
        }

        // POST /api/waste-reports
        // Citizen only
        [HttpPost]
        [Authorize]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateWasteReportForm form)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            var roleIdClaim = User.FindFirst("RoleId")?.Value;
            if (!string.Equals(roleIdClaim, CitizenRoleId, StringComparison.Ordinal))
            {
                return Forbid();
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
                    WasteTypeId = form.WasteTypeId
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

