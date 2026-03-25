using BusinessLogicLayer.DTOs.Assignment;
using BusinessLogicLayer.DTOs.CollectionRequest;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class CollectionRequestService : ICollectionRequestService
    {
        private readonly IUnitOfWork _uow;

        private static readonly string[] VisibleAssignmentStatuses =
        {
            "Assigned",
            "OnTheWay",
            "Arrived",
            "ReportedIssue",
            "Failed"
        };

        public CollectionRequestService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        private static DataAccessLayer.Models.Collectorassignment? GetCurrentAssignment(
            IEnumerable<DataAccessLayer.Models.Collectorassignment> assignments)
        {
            return assignments
                .Where(a => !string.IsNullOrWhiteSpace(a.Status)
                    && VisibleAssignmentStatuses.Contains(a.Status))
                .OrderByDescending(a => a.ArrivedAt ?? DateTime.MinValue)
                .ThenByDescending(a => a.StartedAt ?? DateTime.MinValue)
                .ThenByDescending(a => a.AssignedAt ?? DateTime.MinValue)
                .FirstOrDefault();
        }

        public async Task<IEnumerable<CollectionRequestDto>> GetCollectionRequestsByEnterpriseAsync(int enterpriseId)
        {
            var requests = await _uow.CollectionRequests.GetByEnterpriseIdAsync(enterpriseId);

            return requests.Select(r =>
            {
                var currentAssignment = GetCurrentAssignment(r.Collectorassignments);

                return new CollectionRequestDto
                {
                    RequestId = r.RequestId,
                    ReportId = r.ReportId,
                    EnterpriseId = r.EnterpriseId,
                    EnterpriseName = r.Enterprise?.FullName,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt,

                    WasteTypeId = r.Report?.WasteTypes != null
                        ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.WasteTypeId))
                        : string.Empty,
                    WasteTypeName = r.Report?.WasteTypes != null
                        ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.Name))
                        : string.Empty,

                    ReportImageUrl = r.Report?.ImageUrl,
                    Latitude = r.Report?.Latitude,
                    Longitude = r.Report?.Longitude,
                    ReportDescription = r.Report?.Description,
                    ReportStatus = r.Report?.Status,
                    ReportCreatedAt = r.Report?.CreatedAt,

                    CurrentAssignmentId = currentAssignment?.AssignmentId,
                    AssignedCollectorId = currentAssignment?.AssignedCollector,
                    AssignedCollectorName = currentAssignment?.AssignedCollectorNavigation?.FullName,
                    AssignmentStatus = currentAssignment?.Status,
                    AssignedAt = currentAssignment?.AssignedAt
                };
            }).ToList();
        }

        public async Task<CollectionRequestDetailDto?> GetCollectionRequestDetailAsync(int requestId, int enterpriseId)
        {
            var request = await _uow.CollectionRequests.GetByIdWithDetailsAsync(requestId);
            if (request == null)
            {
                return null;
            }

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

            return requests.Select(r =>
            {
                var currentAssignment = GetCurrentAssignment(r.Collectorassignments);

                return new CollectionRequestDto
                {
                    RequestId = r.RequestId,
                    ReportId = r.ReportId,
                    EnterpriseId = r.EnterpriseId,
                    EnterpriseName = r.Enterprise?.FullName,
                    Status = r.Status,
                    CreatedAt = r.CreatedAt,

                    WasteTypeId = r.Report?.WasteTypes != null
                        ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.WasteTypeId))
                        : string.Empty,
                    WasteTypeName = r.Report?.WasteTypes != null
                        ? string.Join(", ", r.Report.WasteTypes.Select(wt => wt.Name))
                        : string.Empty,

                    ReportImageUrl = r.Report?.ImageUrl,
                    Latitude = r.Report?.Latitude,
                    Longitude = r.Report?.Longitude,
                    ReportDescription = r.Report?.Description,
                    ReportStatus = r.Report?.Status,
                    ReportCreatedAt = r.Report?.CreatedAt,

                    CurrentAssignmentId = currentAssignment?.AssignmentId,
                    AssignedCollectorId = currentAssignment?.AssignedCollector,
                    AssignedCollectorName = currentAssignment?.AssignedCollectorNavigation?.FullName,
                    AssignmentStatus = currentAssignment?.Status,
                    AssignedAt = currentAssignment?.AssignedAt
                };
            }).ToList();
        }

        public async Task<IEnumerable<AssignmentHistoryDto>> GetAssignmentHistoryByRequestAsync(int requestId, int enterpriseId)
        {
            var request = await _uow.CollectionRequests.GetByIdAsync(requestId);
            if (request == null)
            {
                throw new InvalidOperationException("Collection request not found");
            }

            if (request.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only view assignments for your own collection requests");
            }

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
