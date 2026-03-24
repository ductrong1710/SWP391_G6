using BusinessLogicLayer.DTOs.Feedback;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IFeedbackService
    {
        Task<FeedbackResponseDto> CreateFeedbackAsync(int userId, CreateFeedbackDto dto);
        Task<IEnumerable<FeedbackResponseDto>> GetFeedbacksByReportIdAsync(int reportId);
        Task<IEnumerable<FeedbackResponseDto>> GetAllFeedbacksAsync();
        Task<FeedbackDetailDto> GetFeedbackDetailAsync(int feedbackId);
        Task<FeedbackResponseDto> ResolveFeedbackAsync(int feedbackId, ResolveFeedbackDto dto);
        Task<FeedbackResponseDto> RejectFeedbackAsync(int feedbackId);
    }
}
