using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Admin: Get aggregated dashboard statistics for charts
        /// </summary>
        /// <param name="year">Year to filter monthly data (defaults to current year)</param>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetAdminDashboard([FromQuery] int? year)
        {
            var targetYear = year ?? DateTime.Now.Year;
            var dashboard = await _dashboardService.GetAdminDashboardAsync(targetYear);
            return Ok(dashboard);
        }
    }
}
