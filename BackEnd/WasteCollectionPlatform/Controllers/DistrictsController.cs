using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/districts")]
    public class DistrictsController : ControllerBase
    {
        private readonly IDistrictService _districtService;

        public DistrictsController(IDistrictService districtService)
        {
            _districtService = districtService;
        }

        [HttpGet]
        [Authorize(Roles = "Admin,Enterprise")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _districtService.GetAllAsync();
            return Ok(result);
        }
    }
}
