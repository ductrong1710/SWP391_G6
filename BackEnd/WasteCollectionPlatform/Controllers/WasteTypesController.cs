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

       
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllAsync();
            return Ok(result);
        }

       
        [HttpGet("{id:int}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var item = await _service.GetByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }

            return Ok(item);
        }

        
        [HttpPost]
        [Authorize(Roles = "Admin")]
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

        
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
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

        
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
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

