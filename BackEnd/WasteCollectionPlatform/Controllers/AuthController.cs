using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Mvc;

namespace WasteCollectionPlatform.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        /// <summary>
        /// Login and get JWT token
        /// </summary>
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _authService.AuthenticateAsync(request.Email, request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
            }

            var token = _authService.GenerateJwtToken(user);

            var response = new LoginResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    UserId = user.UserId,
                    FullName = user.FullName,
                    Email = user.Email,
                    RoleName = user.Role?.RoleName ?? ""
                }
            };

            return Ok(response);
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequestDto request)
        {
            await _authService.RegisterCitizenAsync(request);
            return Ok(new { message = "OTP sent to email" });
        }

        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpRequestDto request)
        {
            var user = await _authService.VerifyOtpAndCreateUserAsync(
                request.Email,
                request.Otp
            );

            return Ok(new { message = "Register successful", user.UserId });
        }


    }
}