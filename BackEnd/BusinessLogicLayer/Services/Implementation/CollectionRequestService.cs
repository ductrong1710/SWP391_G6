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

        public async Task<CollectorAssignmentResponseDto> ReassignCollectorAsync(int requestId, int enterpriseId, ReassignCollectorDto dto)
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
                throw new UnauthorizedAccessException("You can only reassign collectors for your own collection requests");
            }

            // Get active assignment
            var activeAssignment = await _uow.CollectorAssignments.GetActiveByRequestIdAsync(requestId);
            if (activeAssignment == null)
            {
                throw new InvalidOperationException("No active assignment found for this request");
            }

            // Validate can only reassign when status is "Assigned" (not started yet)
            if (!string.Equals(activeAssignment.Status, "Assigned", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only reassign collector when assignment status is 'Assigned'");
            }

            // Validate new collector exists and has Collector role
            var newCollector = await _uow.Users.GetByIdAsync(dto.NewCollectorId);
            if (newCollector == null)
            {
                throw new ArgumentException("New collector not found");
            }

            if (!string.Equals(newCollector.Role?.RoleName, "Collector", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Selected user is not a Collector");
            }

            // Check if new collector is same as current
            if (activeAssignment.AssignedCollector == dto.NewCollectorId)
            {
                throw new InvalidOperationException("New collector is the same as current collector");
            }

            // Update assignment
            activeAssignment.AssignedCollector = dto.NewCollectorId;
            activeAssignment.AssignedBy = enterpriseId;
            activeAssignment.AssignedAt = DateTime.UtcNow;

            _uow.CollectorAssignments.Update(activeAssignment);
            await _uow.SaveChangesAsync();

            return new CollectorAssignmentResponseDto
            {
                AssignmentId = activeAssignment.AssignmentId,
                RequestId = activeAssignment.RequestId,
                AssignedCollector = activeAssignment.AssignedCollector,
                CollectorName = newCollector.FullName,
                AssignedBy = activeAssignment.AssignedBy,
                AssignedByName = request.Enterprise?.FullName,
                Status = activeAssignment.Status,
                AssignedAt = activeAssignment.AssignedAt
            };
        }
    }
}
