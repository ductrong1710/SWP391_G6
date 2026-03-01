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
            public int WasteTypeId { get; set; }
        }

        public class UpdateWasteReportForm
        {
            public IFormFile? Image { get; set; }
            public decimal Latitude { get; set; }
            public decimal Longitude { get; set; }
            public string? Description { get; set; }
            public int WasteTypeId { get; set; }
        }

        
       [HttpGet]
[Authorize]
public async Task<IActionResult> GetAll()
{
    var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
    
    var isAdmin = string.Equals(roleClaim, "Admin", StringComparison.OrdinalIgnoreCase);
    var isEnterprise = string.Equals(roleClaim, "Enterprise", StringComparison.OrdinalIgnoreCase);

    int? userId = null;
    
    // ✅ CHỈ Citizen/Collector mới filter theo userId
    if (!isAdmin && !isEnterprise)
    {
        var userIdClaim = User.FindFirst("UserId")?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var parsedUserId))
        {
            return Unauthorized(new { message = "Invalid or missing UserId claim" });
        }
        userId = parsedUserId;
    }

    var reports = await _service.GetAllAsync(userId);  // ✅ Enterprise: userId = null → lấy tất cả
    return Ok(reports);
}

       
        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isAdmin = string.Equals(roleClaim, "Admin", StringComparison.OrdinalIgnoreCase);

            int? userId = null;
            if (!isAdmin)
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
            {
                return NotFound(new { message = "Waste report not found" });
            }

            return Ok(report);
        }

        
        [HttpPost]
        [Authorize(Roles = "Citizen")]
        [Consumes("multipart/form-data")]
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

        
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Citizen")]
        [Consumes("multipart/form-data")]
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
                    WasteTypeId = form.WasteTypeId
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

        
        [HttpPut("{id:int}/cancel")]
        [Authorize(Roles = "Citizen")]
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

        [HttpPut("{id:int}/accept")]
        [Authorize(Roles = "Enterprise")]
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

        [HttpPut("{id:int}/reject")]
        [Authorize(Roles = "Enterprise")]
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

