using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Services.Interface;
using Microsoft.AspNetCore.Identity.Data;
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
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // 1. Gọi Service để xác thực
            var user = _authService.Authenticate(request.Email, request.Password);

            if (user == null)
            {
                return Unauthorized(new { message = "Email hoặc mật khẩu không đúng." });
            }

            // 2. Nếu OK, gọi Service để tạo Token
            var token = _authService.GenerateJwtToken(user);

            return Ok(new
            {
                message = "Đăng nhập thành công",
                token = token,
                user = new { user.UserId, user.FullName, user.Email, user.RoleId }
            });
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