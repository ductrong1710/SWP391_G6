using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

<<<<<<< HEAD
        /// <summary>
        /// Lấy danh sách tất cả users (Admin only)
        /// </summary>
=======
        
>>>>>>> 8a370204f4390a9bd8056ea36986c0f2cfb25ab3
        [HttpGet]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(IEnumerable<UserResponseDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

<<<<<<< HEAD
        /// <summary>
        /// Lấy user theo ID
        /// </summary>
=======
>>>>>>> 8a370204f4390a9bd8056ea36986c0f2cfb25ab3
        [HttpGet("{id:int}")]
        [Authorize]
        [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null)
                return NotFound(new { message = "User not found" });

            return Ok(user);
        }

<<<<<<< HEAD
        /// <summary>
        /// Create a new user (Admin/Enterprise only)
        /// </summary>
        /// <param name="request">User creation data</param>
        /// <returns>Created user</returns>
        /// <response code="201">User created successfully</response>
        /// <response code="400">Invalid request data</response>
        /// <response code="409">Email or phone already exists</response>
=======
        
>>>>>>> 8a370204f4390a9bd8056ea36986c0f2cfb25ab3
        [HttpPost]
        //[Authorize(Roles = "Administrator,Enterprise")]
        [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserRequestDto request)
        {
            try
            {
                _logger.LogInformation("Creating user with email: {Email}", request.Email);

                var result = await _userService.CreateUserAsync(request);

                _logger.LogInformation("User created successfully: {UserId}", result.UserId);

                return CreatedAtAction(nameof(CreateUser), new { id = result.UserId }, result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error: {Message}", ex.Message);
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("exists"))
            {
                _logger.LogWarning(ex, "Conflict error: {Message}", ex.Message);
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create user: {Email}", request.Email);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

<<<<<<< HEAD
        /// <summary>
        /// Update user (Admin only)
        /// </summary>
=======
        
>>>>>>> 8a370204f4390a9bd8056ea36986c0f2cfb25ab3
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequestDto request)
        {
            try
            {
                _logger.LogInformation("Updating user: {UserId}", id);

                var result = await _userService.UpdateUserAsync(id, request);

                _logger.LogInformation("User updated successfully: {UserId}", id);

                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Validation error: {Message}", ex.Message);
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
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update user: {UserId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

<<<<<<< HEAD
        /// <summary>
        /// Delete user (Admin only)
        /// </summary>
=======
>>>>>>> 8a370204f4390a9bd8056ea36986c0f2cfb25ab3
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                _logger.LogInformation("Deleting user: {UserId}", id);

                await _userService.DeleteUserAsync(id);

                _logger.LogInformation("User deleted successfully: {UserId}", id);

                return NoContent();
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("not found"))
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to delete user: {UserId}", id);
                return StatusCode(500, new { message = "Internal server error" });
            }
        }
    }
}
