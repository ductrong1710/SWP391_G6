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
    }
}

