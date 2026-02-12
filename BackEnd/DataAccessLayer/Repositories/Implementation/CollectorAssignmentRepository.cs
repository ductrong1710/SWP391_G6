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
                .Include(x => x.Request)
                .FirstOrDefaultAsync(x => x.AssignmentId == assignmentId);
        }

        public async Task<IEnumerable<Collectorassignment>> GetByRequestIdAsync(int requestId)
        {
            return await _context.Collectorassignments
                .Include(x => x.AssignedCollectorNavigation)
                .Include(x => x.AssignedByNavigation)
                .Where(x => x.RequestId == requestId)
                .OrderByDescending(x => x.AssignedAt)
                .ToListAsync();
        }
    }
}
