using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
            // Validate basic
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

            // Lấy lại user có Role để map
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

            // Validate email unique (exclude current user)
            if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
            {
                if (await _uow.Users.EmailExistsExceptAsync(request.Email, id))
                    throw new InvalidOperationException("Email already exists");
            }

            // Validate phone unique (exclude current user)
            if (!string.IsNullOrWhiteSpace(request.Phone) && request.Phone != user.Phone)
            {
                if (await _uow.Users.PhoneExistsExceptAsync(request.Phone, id))
                    throw new InvalidOperationException("Phone already exists");
            }

            // Update fields
            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;

            if (!string.IsNullOrWhiteSpace(request.Email))
                user.Email = request.Email;

            if (!string.IsNullOrWhiteSpace(request.Phone))
                user.Phone = request.Phone;

            if (request.RoleId > 0)
                user.RoleId = request.RoleId;

            if (!string.IsNullOrWhiteSpace(request.Status))
                user.Status = request.Status;

            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();

            // Reload to get updated Role
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
            // Validate input
            if (string.IsNullOrWhiteSpace(dto.OldPassword))
                throw new ArgumentException("Old password is required");

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
                throw new ArgumentException("New password is required");

            if (dto.NewPassword != dto.ConfirmPassword)
                throw new ArgumentException("New password and confirm password do not match");

            // Get user
            var user = await _uow.Users.GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            // Verify old password
            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.Password))
                throw new ArgumentException("Old password is incorrect");

            // Check new password is different from old password
            if (BCrypt.Net.BCrypt.Verify(dto.NewPassword, user.Password))
                throw new ArgumentException("New password must be different from old password");

            // Hash and update new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();
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
                CreatedAt = user.CreatedAt
            };
        }
    }
}