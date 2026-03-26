using BusinessLogicLayer.DTOs.WasteType;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/waste-types")]
    public class WasteTypesController : ControllerBase
    {
        private readonly IWasteTypeService _service;

        public WasteTypesController(IWasteTypeService service)
        {
            _service = service;
        }

       
        /// <summary>
        /// Authenticated: Get all waste types
        /// </summary>
        [HttpGet]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        /// <summary>
        /// Authenticated: Get all waste types
        /// </summary>
        [HttpGet]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetAll()
        {
            bool isAdmin = User.IsInRole("Admin");
            bool onlyActive = !isAdmin;
            var result = await _service.GetAllAsync(onlyActive);

            return Ok(result);
        }


        /// <summary>
        /// Authenticated: Get waste type by ID
        /// </summary>
        [HttpGet("{id:int}")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        
        /// <summary>
        /// Admin: Create new waste type
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Create([FromBody] CreateWasteTypeDto dto)
        {
            try
            {
                var created = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = created.WasteTypeId }, created);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("exists"))
            {
                return Conflict(new { message = ex.Message });
            }
        }

        
        /// <summary>
        /// Admin: Update waste type
        /// </summary>
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateWasteTypeDto dto)
        {
            try
            {
                var updated = await _service.UpdateAsync(id, dto);
                return Ok(updated);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("exists"))
            {
                return Conflict(new { message = ex.Message });
            }
        }

        
        /// <summary>
        /// Admin: Delete waste type
        /// </summary>
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _service.DeleteAsync(id);
                return NoContent();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
        }
    }
}

