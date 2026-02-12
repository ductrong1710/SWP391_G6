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
    }
}
