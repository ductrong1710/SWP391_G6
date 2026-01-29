using BusinessLogicLayer.CacheModels;
using BusinessLogicLayer.DTOs.Auth;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BusinessLogicLayer.Services.Service
{
    public class AuthService : IAuthService
    {
        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _configuration;
        private readonly IMemoryCache _cache;
        private readonly IEmailService _emailService;
        private readonly AppDbContext _context;

        public AuthService(AppDbContext context,
            IUnitOfWork uow,
            IConfiguration configuration,
            IMemoryCache cache,
            IEmailService emailService)
        {
            _context = context;
            _uow = uow;
            _configuration = configuration;
            _cache = cache;
            _emailService = emailService;
        }
        public async Task RegisterCitizenAsync(RegisterRequestDto request)
        {
            if (request.Password != request.ConfirmPassword)
                throw new ArgumentException("Password confirmation does not match");

            if (await _uow.Users.EmailExistsAsync(request.Email))
                throw new InvalidOperationException("Email already exists");

            var otp = new Random().Next(100000, 999999).ToString();

            _cache.Set(
                $"OTP_{request.Email}",
                new RegisterCacheModel
                {
                    Otp = otp,
                    Email = request.Email,
                    Password = request.Password,
                    FullName = request.FullName
                },
                TimeSpan.FromMinutes(5)
            );

            await _emailService.SendEmailAsync(
                request.Email,
                "Your OTP Code",
                $"Your OTP is: {otp}"
            );
            var html = LoadEmailTemplate("OtpVerification.html")
                    .Replace("{{FullName}}", request.FullName)
                    .Replace("{{OTP}}", otp);

            await _emailService.SendEmailAsync(
                request.Email,
                "Xác minh đăng ký",
                html,
                isHtml: true
            );

        }
        private string LoadEmailTemplate(string fileName)
        {
            var path = Path.Combine(
                Directory.GetCurrentDirectory(),
                "EmailTemplates",
                fileName
            );

            if (!File.Exists(path))
                throw new FileNotFoundException($"Email template not found: {path}");

            return File.ReadAllText(path);
        }


        public async Task<User> VerifyOtpAndCreateUserAsync(string email, string otp)
        {
            // ✅ Chặn verify lại / gọi 2 lần
            if (await _uow.Users.EmailExistsAsync(email))
                throw new InvalidOperationException("User already registered");

            if (!_cache.TryGetValue($"OTP_{email}", out RegisterCacheModel cached))
                throw new InvalidOperationException("OTP expired or not found");

            if (cached.Otp != otp)
                throw new InvalidOperationException("Invalid OTP");

            var user = new User
            {
                Email = cached.Email,
                FullName = cached.FullName,
                Password = BCrypt.Net.BCrypt.HashPassword(cached.Password),
                RoleId = 1,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Users.AddAsync(user);
            await _uow.SaveChangesAsync();

            _cache.Remove($"OTP_{email}");

            return user;
        }



        public User? Authenticate(string email, string password)
        {
            // 1. Tìm user
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(password, user.Password))
            {
                return null;
            }
            if (user.Status != "Active")
            {
                return null;
            }

            // 3. Trả về user nếu hợp lệ
            return user;
        }

        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

            var roleName = _context.Roles
                .Where(r => r.RoleId == user.RoleId)
                .Select(r => r.RoleName)
                .FirstOrDefault() ?? string.Empty;

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim("UserId", user.UserId.ToString()),
                new Claim("FullName", user.FullName),
                new Claim("RoleId", user.RoleId.ToString()),
                new Claim(ClaimTypes.Role, roleName)
            };

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(3),
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}