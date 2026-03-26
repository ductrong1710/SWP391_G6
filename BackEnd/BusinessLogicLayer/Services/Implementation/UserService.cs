using BusinessLogicLayer.DTOs.User;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _uow;
        private readonly AppDbContext _db;

        public UserService(IUnitOfWork uow, AppDbContext db)
        {
            _uow = uow;
            _db = db;
        }

        public async Task<UserResponseDto> CreateUserAsync(CreateUserRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                throw new ArgumentException("Email is required");

            if (string.IsNullOrWhiteSpace(request.Password))
                throw new ArgumentException("Password is required");

            if (await _uow.Users.EmailExistsAsync(request.Email))
                throw new InvalidOperationException("Email already exists");

            if (!string.IsNullOrWhiteSpace(request.Phone) && await _uow.Users.PhoneExistsAsync(request.Phone))
                throw new InvalidOperationException("Phone already exists");

            var role = await _db.Roles.FirstOrDefaultAsync(r => r.RoleId == request.RoleId);
            if (role == null)
                throw new InvalidOperationException("Role not found");

            if (string.Equals(role.RoleName, "Enterprise", StringComparison.OrdinalIgnoreCase))
            {
                if (!request.ManagedDistrictId.HasValue)
                    throw new ArgumentException("ManagedDistrictId is required for Enterprise");

                var districtAlreadyAssigned = await _db.EnterpriseProfiles
                    .AnyAsync(x => x.ManagedDistrictId == request.ManagedDistrictId.Value);

                if (districtAlreadyAssigned)
                    throw new InvalidOperationException("This district already has a registered enterprise");
            }

            if (string.Equals(role.RoleName, "Collector", StringComparison.OrdinalIgnoreCase)
                && !request.EnterpriseId.HasValue)
            {
                throw new ArgumentException("EnterpriseId is required for Collector");
            }

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

            if (string.Equals(role.RoleName, "Enterprise", StringComparison.OrdinalIgnoreCase))
            {
                _db.EnterpriseProfiles.Add(new EnterpriseProfile
                {
                    EnterpriseId = user.UserId,
                    ManagedDistrictId = request.ManagedDistrictId!.Value,
                    CreatedAt = DateTime.UtcNow
                });
            }
            else if (string.Equals(role.RoleName, "Collector", StringComparison.OrdinalIgnoreCase))
            {
                _db.CollectorProfiles.Add(new CollectorProfile
                {
                    CollectorId = user.UserId,
                    EnterpriseId = request.EnterpriseId!.Value,
                    IsAvailable = true,
                    AvailabilityUpdatedAt = DateTime.UtcNow,
                    WarningCount = 0,
                    CreatedAt = DateTime.UtcNow
                });
            }

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

            if (!string.IsNullOrWhiteSpace(request.Phone) && request.Phone != user.Phone)
            {
                if (await _uow.Users.PhoneExistsExceptAsync(request.Phone, id))
                    throw new InvalidOperationException("Phone already exists");
            }

            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;

            if (!string.IsNullOrWhiteSpace(request.Phone))
                user.Phone = request.Phone;

            if (!string.IsNullOrWhiteSpace(request.Status))
                user.Status = request.Status;

            var targetRoleId = request.RoleId > 0 ? request.RoleId : user.RoleId;
            var role = await _db.Roles.FirstOrDefaultAsync(r => r.RoleId == targetRoleId);
            if (role == null)
                throw new InvalidOperationException("Role not found");

            user.RoleId = targetRoleId;

            if (string.Equals(role.RoleName, "Enterprise", StringComparison.OrdinalIgnoreCase))
            {
                if (!request.ManagedDistrictId.HasValue)
                    throw new ArgumentException("ManagedDistrictId is required for Enterprise");

                var districtAlreadyAssigned = await _db.EnterpriseProfiles
                    .AnyAsync(x =>
                        x.ManagedDistrictId == request.ManagedDistrictId.Value &&
                        x.EnterpriseId != user.UserId);

                if (districtAlreadyAssigned)
                    throw new InvalidOperationException("This district already has a registered enterprise");

                if (user.CollectorProfile != null)
                {
                    _db.CollectorProfiles.Remove(user.CollectorProfile);
                }

                if (user.EnterpriseProfile == null)
                {
                    _db.EnterpriseProfiles.Add(new EnterpriseProfile
                    {
                        EnterpriseId = user.UserId,
                        ManagedDistrictId = request.ManagedDistrictId.Value,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    user.EnterpriseProfile.ManagedDistrictId = request.ManagedDistrictId.Value;
                }
            }
            else if (string.Equals(role.RoleName, "Collector", StringComparison.OrdinalIgnoreCase))
            {
                if (!request.EnterpriseId.HasValue)
                    throw new ArgumentException("EnterpriseId is required for Collector");

                if (user.EnterpriseProfile != null)
                {
                    _db.EnterpriseProfiles.Remove(user.EnterpriseProfile);
                }

                if (user.CollectorProfile == null)
                {
                    _db.CollectorProfiles.Add(new CollectorProfile
                    {
                        CollectorId = user.UserId,
                        EnterpriseId = request.EnterpriseId.Value,
                        IsAvailable = true,
                        AvailabilityUpdatedAt = DateTime.UtcNow,
                        WarningCount = 0,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                else
                {
                    user.CollectorProfile.EnterpriseId = request.EnterpriseId.Value;
                }
            }
            else
            {
                if (user.EnterpriseProfile != null)
                {
                    _db.EnterpriseProfiles.Remove(user.EnterpriseProfile);
                }

                if (user.CollectorProfile != null)
                {
                    _db.CollectorProfiles.Remove(user.CollectorProfile);
                }
            }

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

            if (user.CollectorProfile != null)
            {
                user.CollectorProfile.WarningCount = 0;
            }

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

            if (user.EnterpriseProfile != null)
            {
                _db.EnterpriseProfiles.Remove(user.EnterpriseProfile);
            }

            if (user.CollectorProfile != null)
            {
                _db.CollectorProfiles.Remove(user.CollectorProfile);
            }

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

            if (user.CollectorProfile == null)
                throw new InvalidOperationException("Collector profile not found");

            user.CollectorProfile.IsAvailable = isAvailable;
            user.CollectorProfile.AvailabilityUpdatedAt = DateTime.UtcNow;

            _uow.Users.Update(user);
            await _uow.SaveChangesAsync();

            var updated = await _uow.Users.GetByIdAsync(userId);
            return MapToDto(updated!);
        }
        public async Task<UserResponseDto> UpdateMyProfileAsync(int userId, UpdateProfileRequestDto request)
{
    // 1. Tìm user đang đăng nhập
    var user = await _uow.Users.GetByIdAsync(userId);
    if (user == null)
        throw new InvalidOperationException("User not found");

    // 2. Kiểm tra số điện thoại có bị trùng với người khác không
    if (!string.IsNullOrWhiteSpace(request.Phone) && request.Phone != user.Phone)
    {
        if (await _uow.Users.PhoneExistsExceptAsync(request.Phone, userId))
            throw new InvalidOperationException("Phone already exists");
    }

    // 3. Cập nhật các trường thông tin cho phép
    if (!string.IsNullOrWhiteSpace(request.FullName))
        user.FullName = request.FullName;

    if (!string.IsNullOrWhiteSpace(request.Phone))
        user.Phone = request.Phone;

    // 4. Lưu vào Database
    _uow.Users.Update(user);
    await _uow.SaveChangesAsync();

    // 5. Trả về thông tin mới nhất
    var updated = await _uow.Users.GetByIdAsync(userId);
    return MapToDto(updated!);
}

        private static UserResponseDto MapToDto(User user)
        {
            return new UserResponseDto
            {
                UserId = user.UserId,
                RoleId = user.RoleId,
                Email = user.Email ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Phone = user.Phone ?? string.Empty,
                RoleName = user.Role?.RoleName ?? string.Empty,
                Status = user.Status ?? string.Empty,
                CreatedAt = user.CreatedAt,
                IsAvailable = user.CollectorProfile?.IsAvailable ?? false,
                AvailabilityUpdatedAt = user.CollectorProfile?.AvailabilityUpdatedAt,
                ManagedDistrictId = user.EnterpriseProfile?.ManagedDistrictId,
                EnterpriseId = user.CollectorProfile?.EnterpriseId
            };
        }
    }
}
