using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementation
{
    public class WasteReportRepository : IWasteReportRepository
    {
        private readonly AppDbContext _context;

        public WasteReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Wastereport entity)
        {
            await _context.Wastereports.AddAsync(entity);
        }

        public async Task<int> CountByUserSinceAsync(int userId, DateTime sinceUtc)
        {
            return await _context.Wastereports
                .CountAsync(x => x.SubmittedBy == userId && x.CreatedAt >= sinceUtc);
        }

        public async Task<Wastereport?> GetByIdAsync(int reportId)
        {
            return await _context.Wastereports
                .Include(x => x.SubmittedByNavigation)
                .Include(x => x.WasteTypes)
                .FirstOrDefaultAsync(x => x.ReportId == reportId);
        }

        public void Update(Wastereport entity)
        {
            _context.Wastereports.Update(entity);
        }

        public async Task<IEnumerable<Wastereport>> GetAllAsync()
        {
            return await _context.Wastereports
                .Include(x => x.SubmittedByNavigation)
                .Include(x => x.WasteTypes)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Wastereport>> GetByUserIdAsync(int userId)
        {
            return await _context.Wastereports
                .Include(x => x.SubmittedByNavigation)
                .Include(x => x.WasteTypes)
                .Where(x => x.SubmittedBy == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Wastereport>> FindNearbyReportsAsync(
         List<int> wasteTypeIds,
            decimal latitude,
            decimal longitude,
            decimal latDelta,
            decimal lonDelta,
            DateTime sinceUtc)
        {
            return await _context.Wastereports
                .Where(x => x.WasteTypes.Any(wt => wasteTypeIds.Contains(wt.WasteTypeId))
                    && x.CreatedAt >= sinceUtc
                    && x.Latitude >= latitude - latDelta
                    && x.Latitude <= latitude + latDelta
                    && x.Longitude >= longitude - lonDelta
                    && x.Longitude <= longitude + lonDelta
                    && x.Status != "Cancelled")
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }
    }
}

