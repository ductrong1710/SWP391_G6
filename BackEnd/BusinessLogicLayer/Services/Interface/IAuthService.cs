using BusinessLogicLayer.DTOs.Auth;
using DataAccessLayer.Models;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IAuthService
    {
        Task RegisterCitizenAsync(RegisterRequestDto request);
        Task<User> VerifyOtpAndCreateUserAsync(string email, string otp);
        Task<User?> AuthenticateAsync(string email, string password);
        string GenerateJwtToken(User user);
    }
}