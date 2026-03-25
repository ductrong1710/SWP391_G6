using BusinessLogicLayer.DTOs.User;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IUserService
    {
        Task<UserResponseDto> CreateUserAsync(CreateUserRequestDto request);
        Task<UserResponseDto?> GetByIdAsync(int id);
        Task<IEnumerable<UserResponseDto>> GetAllAsync();
        Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserRequestDto request);
        Task DeleteUserAsync(int id);
        Task ChangePasswordAsync(int userId, ChangePasswordDto dto);
        Task<UserResponseDto> UpdateCollectorAvailabilityAsync(int userId, bool isAvailable);
        Task<UserResponseDto> SoftDeleteUserAsync(int id);
        Task<UserResponseDto> ReactivateUserAsync(int id);

    }
}