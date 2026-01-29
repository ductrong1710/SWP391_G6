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

            if (await _uow.Users.PhoneExistsAsync(request.Phone))
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
