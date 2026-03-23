using BusinessLogicLayer.DTOs.Feedback;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;

namespace BusinessLogicLayer.Services.Implementation
{
    public class FeedbackService : IFeedbackService
    {
        private readonly IUnitOfWork _uow;

        public FeedbackService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<FeedbackResponseDto> CreateFeedbackAsync(int userId, CreateFeedbackDto dto)
        {
            var user = await _uow.Users.GetByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            var report = await _uow.WasteReports.GetByIdAsync(dto.ReportId);
            if (report == null)
                throw new InvalidOperationException("Report not found");

            var feedback = new Feedback
            {
                UserId = userId,
                ReportId = dto.ReportId,
                Content = dto.Content,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Feedbacks.AddAsync(feedback);
            await _uow.SaveChangesAsync();

            return new FeedbackResponseDto
            {
                FeedbackId = feedback.FeedbackId,
                UserId = feedback.UserId,
                UserName = user.FullName ?? "Unknown",
                ReportId = feedback.ReportId,
                Content = feedback.Content,
                Status = feedback.Status,
                CreatedAt = feedback.CreatedAt
            };
        }

        public async Task<IEnumerable<FeedbackResponseDto>> GetFeedbacksByReportIdAsync(int reportId)
        {
            var allFeedbacks = await _uow.Feedbacks.GetAllAsync();
            var feedbacks = allFeedbacks.Where(f => f.ReportId == reportId).OrderByDescending(f => f.CreatedAt);

            var result = new List<FeedbackResponseDto>();
            foreach (var f in feedbacks)
            {
                var user = await _uow.Users.GetByIdAsync(f.UserId);
                result.Add(new FeedbackResponseDto
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    UserName = user?.FullName ?? "Unknown",
                    ReportId = f.ReportId,
                    Content = f.Content,
                    Status = f.Status,
                    CreatedAt = f.CreatedAt
                });
            }

            return result;
        }

        public async Task<IEnumerable<FeedbackResponseDto>> GetAllFeedbacksAsync()
        {
            var allFeedbacks = await _uow.Feedbacks.GetAllAsync();
            var sortedFeedbacks = allFeedbacks.OrderByDescending(f => f.CreatedAt);

            var result = new List<FeedbackResponseDto>();
            foreach (var f in sortedFeedbacks)
            {
                var user = await _uow.Users.GetByIdAsync(f.UserId);
                result.Add(new FeedbackResponseDto
                {
                    FeedbackId = f.FeedbackId,
                    UserId = f.UserId,
                    UserName = user?.FullName ?? "Unknown",
                    ReportId = f.ReportId,
                    Content = f.Content,
                    Status = f.Status,
                    CreatedAt = f.CreatedAt
                });
            }

            return result;
        }

        public async Task<FeedbackResponseDto> UpdateFeedbackStatusAsync(int feedbackId, string status)
        {
            var feedback = await _uow.Feedbacks.GetByIdAsync(feedbackId);
            if (feedback == null)
                throw new InvalidOperationException("Feedback not found");

            feedback.Status = status;
            _uow.Feedbacks.Update(feedback);
            await _uow.SaveChangesAsync();

            var user = await _uow.Users.GetByIdAsync(feedback.UserId);

            return new FeedbackResponseDto
            {
                FeedbackId = feedback.FeedbackId,
                UserId = feedback.UserId,
                UserName = user?.FullName ?? "Unknown",
                ReportId = feedback.ReportId,
                Content = feedback.Content,
                Status = feedback.Status,
                CreatedAt = feedback.CreatedAt
            };
        }
    }
}
