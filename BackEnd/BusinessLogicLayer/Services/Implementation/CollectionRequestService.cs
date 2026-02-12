using BusinessLogicLayer.DTOs.CollectionRequest;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class CollectionRequestService : ICollectionRequestService
    {
        private readonly IUnitOfWork _uow;

        public CollectionRequestService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<CollectorAssignmentResponseDto> AssignCollectorAsync(int requestId, int enterpriseId, AssignCollectorDto dto)
        {
            // Validate collection request exists
            var request = await _uow.CollectionRequests.GetByIdAsync(requestId);
            if (request == null)
            {
                throw new InvalidOperationException("Collection request not found");
            }

            // Validate request belongs to this enterprise
            if (request.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only assign collectors to your own collection requests");
            }

            // Validate collector exists and has Collector role
            var collector = await _uow.Users.GetByIdAsync(dto.CollectorId);
            if (collector == null)
            {
                throw new ArgumentException("Collector not found");
            }

            // Check if collector has "Collector" role
            if (!string.Equals(collector.Role?.RoleName, "Collector", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Selected user is not a Collector");
            }

            // Check if already assigned
            var existingAssignments = await _uow.CollectorAssignments.GetByRequestIdAsync(requestId);
            if (existingAssignments.Any(x => x.AssignedCollector == dto.CollectorId && x.Status != "Cancelled"))
            {
                throw new InvalidOperationException("This collector is already assigned to this request");
            }

            // Create assignment
            var assignment = new Collectorassignment
            {
                RequestId = requestId,
                AssignedCollector = dto.CollectorId,
                AssignedBy = enterpriseId,
                Status = "Assigned",
                AssignedAt = DateTime.UtcNow
            };

            await _uow.CollectorAssignments.AddAsync(assignment);

            // Update collection request status
            request.Status = "Assigned";
            _uow.CollectionRequests.Update(request);

            await _uow.SaveChangesAsync();

            return new CollectorAssignmentResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                AssignedCollector = assignment.AssignedCollector,
                CollectorName = collector.FullName,
                AssignedBy = assignment.AssignedBy,
                AssignedByName = request.Enterprise?.FullName,
                Status = assignment.Status,
                AssignedAt = assignment.AssignedAt
            };
        }
    }
}
