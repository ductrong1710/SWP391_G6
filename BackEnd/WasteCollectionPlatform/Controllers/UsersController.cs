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

        /// <summary>
        /// Create a new user (Admin/Enterprise only)
        /// </summary>
        /// <param name="request">User creation data</param>
        /// <returns>Created user</returns>
        /// <response code="201">User created successfully</response>
        /// <response code="400">Invalid request data</response>
        /// <response code="409">Email or phone already exists</response>
        [HttpPost]
        //[Authorize(Roles = "Administrator,EnterpriseAdmin")]
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
    }
}
