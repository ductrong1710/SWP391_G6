using BusinessLogicLayer.DTOs.CollectionRequest;

namespace BusinessLogicLayer.Services.Interface
{
    public interface ICollectionRequestService
    {
        Task<CollectorAssignmentResponseDto> AssignCollectorAsync(int requestId, int enterpriseId, AssignCollectorDto dto);
        Task<CollectorAssignmentResponseDto> ReassignCollectorAsync(int requestId, int enterpriseId, ReassignCollectorDto dto);
        Task<CancelAssignmentResponseDto> CancelAssignmentAsync(int assignmentId, int userId, string userRole);

        // View methods
        Task<IEnumerable<CollectionRequestDto>> GetCollectionRequestsByEnterpriseAsync(int enterpriseId);
        Task<CollectionRequestDetailDto?> GetCollectionRequestDetailAsync(int requestId, int enterpriseId);
        Task<IEnumerable<MyAssignmentDto>> GetMyAssignmentsAsync(int collectorId);
        Task<MyAssignmentDto?> GetAssignmentDetailAsync(int assignmentId, int collectorId);
        Task<IEnumerable<CollectionRequestDto>> GetAllCollectionRequestsAsync();

        // Assignment view methods
        Task<IEnumerable<AssignmentDto>> GetAllAssignmentsByEnterpriseAsync(int enterpriseId);
        Task<IEnumerable<AssignmentHistoryDto>> GetAssignmentHistoryByRequestAsync(int requestId, int enterpriseId);
    }
}
