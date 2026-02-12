using BusinessLogicLayer.DTOs.CollectionRequest;

namespace BusinessLogicLayer.Services.Interface
{
    public interface ICollectionRequestService
    {
        Task<CollectorAssignmentResponseDto> AssignCollectorAsync(int requestId, int enterpriseId, AssignCollectorDto dto);
    }
}
