using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;

        public AuthController(IAuthService authService, IUserService userService)
        {
            _authService = authService;
            _userService = userService;
        }

        public class LoginRequest
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }

       
        /// <summary>
        /// Public: Login with email and password
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            var user = _authService.Authenticate(request.Email, request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
            }

            var token = _authService.GenerateJwtToken(user);

            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = token,
                user = new { user.UserId, user.FullName, user.Email, user.RoleId }
            });
        }

        /// <summary>
        /// Public: Register new citizen account
        /// </summary>
        [HttpPost("register")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            await _authService.RegisterCitizenAsync(request);
            return Ok(new { message = "OTP sent to email" });
        }

        /// <summary>
        /// Public: Verify OTP to complete registration
        /// </summary>
        [HttpPost("verify-otp")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyOtp(VerifyOtpRequestDto request)
        {
            var user = await _authService.VerifyOtpAndCreateUserAsync(
                request.Email,
                request.Otp
            );

            return Ok(new { message = "Register successful", user.UserId });
        }

        
        /// <summary>
        /// Authenticated: Change password
        /// </summary>
        [HttpPut("change-password")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Invalid or missing UserId claim" });
            }

            try
            {
                await _userService.ChangePasswordAsync(userId, dto);
                return Ok(new { message = "Password changed successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        /// <summary>
        /// Public: Request password reset OTP
        /// </summary>
        [HttpPost("forgot-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            try
            {
                await _authService.ForgotPasswordAsync(request);
                return Ok(new { message = "OTP has been sent to your email" });
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        
        /// <summary>
        /// Public: Reset password with OTP
        /// </summary>
        [HttpPost("reset-password")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
        {
            try
            {
                await _authService.ResetPasswordAsync(request);
                return Ok(new { message = "Password has been reset successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}