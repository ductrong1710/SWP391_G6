using DataAccessLayer.Models;
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
        IGenericRepository<Reward> Rewards { get; }

        IWasteTypeRepository WasteTypes { get; }
        IWasteReportRepository WasteReports { get; }
        ICollectionRequestRepository CollectionRequests { get; }
        ICollectorAssignmentRepository CollectorAssignments { get; }
        ICollectionConfirmationRepository CollectionConfirmations { get; }
        IGenericRepository<DataAccessLayer.Models.CollectionDetail> CollectionDetails { get; }
        IGenericRepository<DataAccessLayer.Models.Rewardtransaction> RewardTransactions { get; }
        INotificationRepository Notifications { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    }
}
