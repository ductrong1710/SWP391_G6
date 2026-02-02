using BusinessLogicLayer.DTOs.User;

namespace BusinessLogicLayer.DTOs.Auth
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }
}
