using DataAccessLayer.Data;
using DataAccessLayer.Repositories.Interface;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _context;

        public IUserRepository Users { get; }
        public IWasteTypeRepository WasteTypes { get; }
        public IWasteReportRepository WasteReports { get; }
        public ICollectionRequestRepository CollectionRequests { get; }

        public UnitOfWork(
            AppDbContext context,
            IUserRepository userRepository,
            IWasteTypeRepository wasteTypeRepository,
            IWasteReportRepository wasteReportRepository,
            ICollectionRequestRepository collectionRequestRepository)
        {
            _context = context;
            Users = userRepository;
            WasteTypes = wasteTypeRepository;
            WasteReports = wasteReportRepository;
            CollectionRequests = collectionRequestRepository;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
