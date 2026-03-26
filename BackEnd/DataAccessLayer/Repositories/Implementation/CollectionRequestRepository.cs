using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementation
{
    public class CollectionRequestRepository : ICollectionRequestRepository
    {
        private readonly AppDbContext _context;

        public CollectionRequestRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Collectionrequest entity)
        {
            await _context.Collectionrequests.AddAsync(entity);
        }

        public async Task<Collectionrequest?> GetByIdAsync(int requestId)
        {
            return await _context.Collectionrequests
                .Include(x => x.Enterprise)
                .Include(x => x.Report)
                .FirstOrDefaultAsync(x => x.RequestId == requestId);
        }

        public async Task<Collectionrequest?> GetByReportIdAsync(int reportId)
        {
            return await _context.Collectionrequests
                .Include(x => x.Enterprise)
                .Include(x => x.Report)
                .FirstOrDefaultAsync(x => x.ReportId == reportId);
        }

        public void Update(Collectionrequest entity)
        {
            _context.Collectionrequests.Update(entity);
        }

        public async Task<IEnumerable<Collectionrequest>> GetByEnterpriseIdAsync(int enterpriseId)
        {
            return await _context.Collectionrequests
                .Include(x => x.Enterprise)
                .Include(x => x.Report)
                    .ThenInclude(r => r.WasteTypes) 
                .Include(x => x.Report.SubmittedByNavigation)
                .Include(x => x.Collectorassignments)
                     .ThenInclude(a => a.AssignedCollectorNavigation)
                .Where(x => x.EnterpriseId == enterpriseId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<Collectionrequest?> GetByIdWithDetailsAsync(int requestId)
        {
            return await _context.Collectionrequests
                .Include(x => x.Enterprise)
                .Include(x => x.Report)
                    .ThenInclude(r => r.WasteTypes) 
                .Include(x => x.Report.SubmittedByNavigation)
                .Include(x => x.Collectorassignments)
                    .ThenInclude(a => a.AssignedCollectorNavigation)
                .Include(x => x.Collectorassignments)
                    .ThenInclude(a => a.AssignedByNavigation)
                .FirstOrDefaultAsync(x => x.RequestId == requestId);
        }

        public async Task<IEnumerable<Collectionrequest>> GetAllWithDetailsAsync()
        {
            return await _context.Collectionrequests
                .Include(x => x.Enterprise)
                .Include(x => x.Report)
                    .ThenInclude(r => r.WasteTypes) 
                .Include(x => x.Report.SubmittedByNavigation)
                .Include(x => x.Collectorassignments)
                     .ThenInclude(a => a.AssignedCollectorNavigation)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync();
        }
    }
}