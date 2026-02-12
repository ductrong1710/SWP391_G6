using BusinessLogicLayer.DTOs.Collection;

namespace BusinessLogicLayer.Services.Interface
{
    /// <summary>
    /// Service for handling collection process (Collector perspective)
    /// </summary>
    public interface ICollectionService
    {
        Task<StartCollectionResponseDto> StartCollectionAsync(int assignmentId, int collectorId);
        Task<CompleteCollectionResponseDto> CompleteCollectionAsync(int assignmentId, int collectorId, CompleteCollectionDto dto);
    }
}
