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
        public IWasteReportRepository WasteReports { get; }
        public IWasteTypeRepository WasteTypes { get; }

        public UnitOfWork(
            AppDbContext context,
            IUserRepository userRepository,
            IWasteReportRepository wasteReportRepository,
            IWasteTypeRepository wasteTypeRepository)
        {
            _context = context;
            Users = userRepository;
            WasteReports = wasteReportRepository;
            WasteTypes = wasteTypeRepository;
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
