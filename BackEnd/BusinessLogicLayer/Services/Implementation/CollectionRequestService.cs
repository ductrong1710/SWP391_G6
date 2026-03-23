using BusinessLogicLayer.DTOs.Assignment;
using BusinessLogicLayer.DTOs.CollectionRequest;
using BusinessLogicLayer.Services.Interface;
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

        // View methods
        public async Task<IEnumerable<CollectionRequestDto>> GetCollectionRequestsByEnterpriseAsync(int enterpriseId)
        {
            var requests = await _uow.CollectionRequests.GetByEnterpriseIdAsync(enterpriseId);

            return requests.Select(r => new CollectionRequestDto
            {
                RequestId = r.RequestId,
                ReportId = r.ReportId,
                EnterpriseId = r.EnterpriseId,
                EnterpriseName = r.Enterprise?.FullName,
                Status = r.Status,
                CreatedAt = r.CreatedAt,

                // Waste report info
                WasteTypeId = r.Report?.WasteTypes != null ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.WasteTypeId)) : string.Empty,
                WasteTypeName = r.Report?.WasteTypes != null ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.Name)) : string.Empty,

                ReportImageUrl = r.Report?.ImageUrl,
                Latitude = r.Report?.Latitude,
                Longitude = r.Report?.Longitude,
                ReportDescription = r.Report?.Description,
                ReportStatus = r.Report?.Status,
                ReportCreatedAt = r.Report?.CreatedAt,

                // Current active assignment
                CurrentAssignmentId = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignmentId,
                AssignedCollectorId = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignedCollector,
                AssignedCollectorName = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignedCollectorNavigation?.FullName,
                AssignmentStatus = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.Status,
                AssignedAt = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignedAt
            }).ToList();
        }

        public async Task<CollectionRequestDetailDto?> GetCollectionRequestDetailAsync(int requestId, int enterpriseId)
        {
            var request = await _uow.CollectionRequests.GetByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                return null;
            }

            // Validate request belongs to this enterprise
            if (request.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only view your own collection requests");
            }

            return new CollectionRequestDetailDto
            {
                RequestId = request.RequestId,
                ReportId = request.ReportId,
                EnterpriseId = request.EnterpriseId,
                EnterpriseName = request.Enterprise?.FullName,
                EnterpriseEmail = request.Enterprise?.Email,
                EnterprisePhone = request.Enterprise?.Phone,
                Status = request.Status,
                CreatedAt = request.CreatedAt,

                Report = request.Report != null ? new WasteReportInfo
                {
                    ReportId = request.Report.ReportId,
                    SubmittedBy = request.Report.SubmittedBy,
                    CitizenName = request.Report.SubmittedByNavigation?.FullName,
                    CitizenEmail = request.Report.SubmittedByNavigation?.Email,
                    WasteTypeIds = request.Report.WasteTypes?.Select(wt => wt.WasteTypeId).ToList() ?? new List<int>(),
                    WasteTypeNames = request.Report.WasteTypes?.Select(wt => wt.Name).ToList() ?? new List<string>(),

                    ImageUrl = request.Report.ImageUrl,
                    Latitude = request.Report.Latitude,
                    Longitude = request.Report.Longitude,
                    Description = request.Report.Description,
                    Status = request.Report.Status,
                    CreatedAt = request.Report.CreatedAt
                } : null,

                AssignmentHistory = request.Collectorassignments
                    .OrderByDescending(a => a.AssignedAt)
                    .Select(a => new AssignmentHistoryDto
                    {
                        AssignmentId = a.AssignmentId,
                        AssignedCollector = a.AssignedCollector,
                        CollectorName = a.AssignedCollectorNavigation?.FullName,
                        CollectorPhone = a.AssignedCollectorNavigation?.Phone,
                        AssignedBy = a.AssignedBy,
                        AssignedByName = a.AssignedByNavigation?.FullName,
                        Status = a.Status,
                        AssignedAt = a.AssignedAt
                    }).ToList()
            };
        }

        public async Task<IEnumerable<CollectionRequestDto>> GetAllCollectionRequestsAsync()
        {
            var requests = await _uow.CollectionRequests.GetAllWithDetailsAsync();

            return requests.Select(r => new CollectionRequestDto
            {
                RequestId = r.RequestId,
                ReportId = r.ReportId,
                EnterpriseId = r.EnterpriseId,
                EnterpriseName = r.Enterprise?.FullName,
                Status = r.Status,
                CreatedAt = r.CreatedAt,

                // Waste report info
                WasteTypeId = r.Report?.WasteTypes != null ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.WasteTypeId)) : string.Empty,
                WasteTypeName = r.Report?.WasteTypes != null ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.Name)) : string.Empty,

                ReportImageUrl = r.Report?.ImageUrl,
                Latitude = r.Report?.Latitude,
                Longitude = r.Report?.Longitude,
                ReportDescription = r.Report?.Description,
                ReportStatus = r.Report?.Status,
                ReportCreatedAt = r.Report?.CreatedAt,

                // Current active assignment
                CurrentAssignmentId = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignmentId,
                AssignedCollectorId = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignedCollector,
                AssignedCollectorName = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignedCollectorNavigation?.FullName,
                AssignmentStatus = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.Status,
                AssignedAt = r.Collectorassignments.FirstOrDefault(a => a.Status == "Assigned")?.AssignedAt
            }).ToList();
        }

        // Assignment history (read-only, no operations)
        public async Task<IEnumerable<AssignmentHistoryDto>> GetAssignmentHistoryByRequestAsync(int requestId, int enterpriseId)
        {
            // Validate request exists and belongs to this enterprise
            var request = await _uow.CollectionRequests.GetByIdAsync(requestId);
            if (request == null)
            {
                throw new InvalidOperationException("Collection request not found");
            }

            if (request.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only view assignments for your own collection requests");
            }

            // Get assignments for this request
            var assignments = await _uow.CollectorAssignments.GetByRequestIdAsync(requestId);

            return assignments.Select(a => new AssignmentHistoryDto
            {
                AssignmentId = a.AssignmentId,
                AssignedCollector = a.AssignedCollector,
                CollectorName = a.AssignedCollectorNavigation?.FullName,
                CollectorPhone = a.AssignedCollectorNavigation?.Phone,
                AssignedBy = a.AssignedBy,
                AssignedByName = a.AssignedByNavigation?.FullName,
                Status = a.Status,
                AssignedAt = a.AssignedAt
            }).ToList();
        }
    }
}