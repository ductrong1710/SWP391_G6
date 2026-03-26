using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Repositories.Implementation
{
    public class CollectorAssignmentRepository : ICollectorAssignmentRepository
    {
        private readonly AppDbContext _context;

        public CollectorAssignmentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Collectorassignment entity)
        {
            await _context.Collectorassignments.AddAsync(entity);
        }

        public async Task<Collectorassignment?> GetByIdAsync(int assignmentId)
        {
            return await _context.Collectorassignments
                .Include(x => x.AssignedCollectorNavigation)
                .Include(x => x.AssignedByNavigation)
                .Include(x => x.Collectionconfirmation)
                .Include(x => x.Request)
                .FirstOrDefaultAsync(x => x.AssignmentId == assignmentId);
        }

        public async Task<IEnumerable<Collectorassignment>> GetByRequestIdAsync(int requestId)
        {
            return await _context.Collectorassignments
                .Include(x => x.AssignedCollectorNavigation)
                .Include(x => x.AssignedByNavigation)
                .Include(x => x.Collectionconfirmation)
                .Where(x => x.RequestId == requestId)
                .OrderByDescending(x => x.AssignedAt)
                .ToListAsync();
        }

        public async Task<Collectorassignment?> GetActiveByRequestIdAsync(int requestId)
        {
            return await _context.Collectorassignments
                .Include(x => x.AssignedCollectorNavigation)
                .Include(x => x.AssignedByNavigation)
                .Include(x => x.Request)
                    .ThenInclude(r => r.Enterprise)
                .Where(x => x.RequestId == requestId && x.Status == "Assigned")
                .OrderByDescending(x => x.AssignedAt)
                .FirstOrDefaultAsync();
        }

        public void Update(Collectorassignment entity)
        {
            _context.Collectorassignments.Update(entity);
        }

        public async Task<int> CountOpenAssignmentsByCollectorAsync(int collectorId)
        {
            var openStatuses = new[] { "Assigned", "OnTheWay", "Arrived", "ReportedIssue" };

            return await _context.Collectorassignments
                .CountAsync(x =>
                    x.AssignedCollector == collectorId &&
                    openStatuses.Contains(x.Status));
        }

        public async Task<bool> HasActiveTripByCollectorAsync(int collectorId)
        {
            var activeTripStatuses = new[] { "OnTheWay", "Arrived" };

            return await _context.Collectorassignments
                .AnyAsync(x =>
                    x.AssignedCollector == collectorId &&
                    activeTripStatuses.Contains(x.Status));
        }

        public async Task<IEnumerable<Collectorassignment>> GetByCollectorIdAsync(int collectorId)
        {
            return await _context.Collectorassignments
                .Include(x => x.AssignedCollectorNavigation)
                .Include(x => x.AssignedByNavigation)
                .Include(x => x.Collectionconfirmation)
                    .ThenInclude(c => c.CollectionDetails)
                        .ThenInclude(d => d.WasteType)
                .Include(x => x.Request)
                    .ThenInclude(r => r.Enterprise)
                .Include(x => x.Request.Report)
                    .ThenInclude(r => r.WasteTypes)
                .Include(x => x.Request.Report.SubmittedByNavigation)
                .Where(x => x.AssignedCollector == collectorId)
                .OrderByDescending(x => x.AssignedAt)
                .ToListAsync();
        }

        public async Task<Collectorassignment?> GetByIdWithDetailsAsync(int assignmentId)
        {
            return await _context.Collectorassignments
                .Include(x => x.AssignedCollectorNavigation)
                .Include(x => x.AssignedByNavigation)
                .Include(x => x.Collectionconfirmation)
                    .ThenInclude(c => c.CollectionDetails)
                        .ThenInclude(d => d.WasteType)
                .Include(x => x.Request)
                    .ThenInclude(r => r.Enterprise)
                .Include(x => x.Request.Report)
                    .ThenInclude(r => r.WasteTypes)
                .Include(x => x.Request.Report.SubmittedByNavigation)
                .FirstOrDefaultAsync(x => x.AssignmentId == assignmentId);
        }

        public async Task<IEnumerable<Collectorassignment>> GetByEnterpriseIdAsync(int enterpriseId)
        {
            return await _context.Collectorassignments
                .Include(x => x.AssignedCollectorNavigation)
                .Include(x => x.AssignedByNavigation)
                .Include(x => x.Collectionconfirmation)
                .Include(x => x.Request)
                    .ThenInclude(r => r.Enterprise)
                .Include(x => x.Request.Report)
                    .ThenInclude(r => r.WasteTypes)
                .Include(x => x.Request.Report.SubmittedByNavigation)
                .Where(x => x.Request.EnterpriseId == enterpriseId)
                .OrderByDescending(x => x.AssignedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Collectorassignment>> GetAllAsync()
        {
            return await _context.Collectorassignments.ToListAsync();
        }
    }
}
