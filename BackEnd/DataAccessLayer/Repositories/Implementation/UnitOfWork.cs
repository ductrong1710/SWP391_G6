using DataAccessLayer.Data;
using DataAccessLayer.Models;
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
        public IGenericRepository<DataAccessLayer.Models.Reward> Rewards { get; }

        public IWasteTypeRepository WasteTypes { get; }
        public IWasteReportRepository WasteReports { get; }
        public ICollectionRequestRepository CollectionRequests { get; }
        public ICollectorAssignmentRepository CollectorAssignments { get; }
        public ICollectionConfirmationRepository CollectionConfirmations { get; }
        public IGenericRepository<DataAccessLayer.Models.CollectionDetail> CollectionDetails { get; }
        public IGenericRepository<DataAccessLayer.Models.Rewardtransaction> RewardTransactions { get; }
        public INotificationRepository Notifications { get; private set; }

        public UnitOfWork(
            AppDbContext context,
            IUserRepository userRepository,
            IWasteTypeRepository wasteTypeRepository,
            IWasteReportRepository wasteReportRepository,
            ICollectionRequestRepository collectionRequestRepository,
            ICollectorAssignmentRepository collectorAssignmentRepository,
            ICollectionConfirmationRepository collectionConfirmationRepository)
        {
            _context = context;
            Users = userRepository;
            Rewards = new GenericRepository<DataAccessLayer.Models.Reward>(_context);
            WasteTypes = wasteTypeRepository;
            WasteReports = wasteReportRepository;
            CollectionRequests = collectionRequestRepository;
            CollectorAssignments = collectorAssignmentRepository;
            CollectionConfirmations = collectionConfirmationRepository;
            CollectionDetails = new GenericRepository<DataAccessLayer.Models.CollectionDetail>(_context);
            RewardTransactions = new GenericRepository<DataAccessLayer.Models.Rewardtransaction>(_context);
            Notifications = new NotificationRepository(context);
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
