using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Interface
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IWasteTypeRepository WasteTypes { get; }
        IWasteReportRepository WasteReports { get; }
        ICollectionRequestRepository CollectionRequests { get; }
        ICollectorAssignmentRepository CollectorAssignments { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
