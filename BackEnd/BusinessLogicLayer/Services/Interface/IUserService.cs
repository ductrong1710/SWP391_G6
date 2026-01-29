using BusinessLogicLayer.DTOs.User;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IUserService
    {
        Task<UserResponseDto> CreateUserAsync(CreateUserRequestDto request);
        Task<UserResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<UserResponseDto>> GetAllAsync();
    }
}
