using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;

        public UserService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<UserResponseDto> CreateUserAsync(CreateUserRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email is required");

            if (await _uow.Users.EmailExistsAsync(request.Email))
                throw new InvalidOperationException("Email already exists");

            if (!string.IsNullOrWhiteSpace(request.Phone) && await _uow.Users.PhoneExistsAsync(request.Phone))
                throw new InvalidOperationException("Phone already exists");

            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var user = new User
            {
                Email = request.Email,
                Password = hashedPassword,
                FullName = request.FullName,
                Phone = request.Phone,
                RoleId = request.RoleId,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Users.AddAsync(user);
            await _uow.SaveChangesAsync();

            var created = await _uow.Users.GetByIdAsync(user.UserId);

            return MapToDto(created!);
        }

        public async Task<UserResponseDto?> GetByIdAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            return user == null ? null : MapToDto(user);
        }

        public async Task<IEnumerable<UserResponseDto>> GetAllAsync()
        {
            var users = await _uow.Users.GetAllAsync();
            return users.Select(MapToDto);
        }

        public async Task<UserResponseDto> UpdateUserAsync(int id, UpdateUserRequestDto request)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException("User not found");

            // Email is NOT allowed to be changed by admin

            if (!string.IsNullOrWhiteSpace(request.Phone) && request.Phone != user.Phone)
            {
                if (await _uow.Users.PhoneExistsExceptAsync(request.Phone, id))
                    throw new InvalidOperationException("Phone already exists");
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;

            if (!string.IsNullOrWhiteSpace(request.Phone))
                user.Phone = request.Phone;

            if (request.RoleId > 0)
                user.RoleId = request.RoleId;

            if (!string.IsNullOrWhiteSpace(request.Status))
                user.Status = request.Status;

            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();

            var updated = await _uow.Users.GetByIdAsync(id);
            return MapToDto(updated!);
        }

        public async Task<UserResponseDto> SoftDeleteUserAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException("User not found");

            user.Status = "Inactive";
            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();

            var updated = await _uow.Users.GetByIdAsync(id);
            return MapToDto(updated!);
        }

        public async Task<UserResponseDto> ReactivateUserAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException("User not found");

            user.Status = "Active";
            user.WarningCount = 0; // Reset warnings on reactivation
            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();

            var updated = await _uow.Users.GetByIdAsync(id);
            return MapToDto(updated!);
        }

        public async Task DeleteUserAsync(int id)
        {
            var user = await _uow.Users.GetByIdAsync(id);
            if (user == null)
                throw new InvalidOperationException("User not found");

            _uow.Users.Delete(user);
            await _uow.SaveChangesAsync();
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.OldPassword))
                throw new ArgumentException("Old password is required");

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                throw new ArgumentException("New password is required");

            if (dto.NewPassword != dto.ConfirmPassword)
                throw new ArgumentException("New password and confirm password do not match");

            var user = await _uow.Users.GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
                throw new ArgumentException("Old password is incorrect");

            if (BCrypt.Net.BCrypt.Verify(dto.NewPassword, user.Password))
                throw new ArgumentException("New password must be different from old password");

            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();
        }
        public async Task<UserResponseDto> UpdateCollectorAvailabilityAsync(int userId, bool isAvailable)
        {
            var user = await _uow.Users.GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            if (!string.Equals(user.Role?.RoleName, "Collector", StringComparison.OrdinalIgnoreCase))
                throw new UnauthorizedAccessException("Only collectors can update availability");

            user.IsAvailable = isAvailable;
            user.AvailabilityUpdatedAt = DateTime.UtcNow;

            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();

            var updated = await _uow.Users.GetByIdAsync(userId);
            return MapToDto(updated!);
        }

        private static UserResponseDto MapToDto(User user)
        {
            return new UserResponseDto
            {
                UserId = user.UserId,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Phone = user.Phone ?? string.Empty,
                RoleName = user.Role?.RoleName ?? string.Empty,
                Status = user.Status ?? string.Empty,
                CreatedAt = user.CreatedAt,
                IsAvailable = user.IsAvailable,
                AvailabilityUpdatedAt = user.AvailabilityUpdatedAt
            };
        }

        
    }
}