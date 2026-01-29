using BusinessLogicLayer.DTOs.WasteReport;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/waste-reports")]
    public class WasteReportController : ControllerBase
    {
        private readonly IWasteReportService _service;

        public WasteReportController(IWasteReportService service)
        {
            _service = service;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(CreateWasteReportDto dto)
        {
            int userId = int.Parse(User.FindFirst("id")!.Value);

            var reportId = await _service.CreateReportAsync(userId, dto);
            return Ok(new { reportId });
        }

        [HttpGet("pending")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetPending()
        {
            return Ok(await _service.GetPendingReportsAsync());
        }
    }
}
