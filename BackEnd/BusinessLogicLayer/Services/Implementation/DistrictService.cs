using BusinessLogicLayer.DTOs.District;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Data;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services.Implementation
{
    public class DistrictService : IDistrictService
    {
        private readonly AppDbContext _db;

        public DistrictService(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IEnumerable<DistrictResponseDto>> GetAllAsync()
        {
            return await _db.Districts
                .Where(d => d.IsActive)
                .OrderBy(d => d.Name)
                .Select(d => new DistrictResponseDto
                {
                    DistrictId = d.DistrictId,
                    Name = d.Name,
                    Code = d.Code ?? string.Empty
                })
                .ToListAsync();
        }
    }
}
