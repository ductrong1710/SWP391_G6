using BusinessLogicLayer.DTOs.Assignment;

namespace BusinessLogicLayer.Services.Interface
{
    /// <summary>
    /// Service for assignment management (Enterprise perspective)
    /// </summary>
    public interface IAssignmentService
    {
        // Assignment operations
        Task<CollectorAssignmentResponseDto> AssignCollectorAsync(int requestId, int enterpriseId, AssignCollectorDto dto);
        Task<CollectorAssignmentResponseDto> ReassignCollectorAsync(int assignmentId, int enterpriseId, ReassignCollectorDto dto);
        Task<CancelAssignmentResponseDto> CancelAssignmentAsync(int assignmentId, int userId, string userRole);

        // View methods - Enterprise
        Task<IEnumerable<AssignmentDto>> GetAllAssignmentsByEnterpriseAsync(int enterpriseId);
        Task<IEnumerable<AssignmentHistoryDto>> GetAssignmentHistoryByRequestAsync(int requestId, int enterpriseId);

        // View methods - Collector
        Task<IEnumerable<MyAssignmentDto>> GetMyAssignmentsAsync(int collectorId);
        Task<MyAssignmentDto?> GetAssignmentDetailAsync(int assignmentId, int collectorId);
    }
}
