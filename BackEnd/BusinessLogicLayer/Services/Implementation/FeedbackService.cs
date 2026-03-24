using BusinessLogicLayer.DTOs.Feedback;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

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

            return MapToResponse(feedback, user.FullName ?? "Unknown");
        }

        public async Task<IEnumerable<FeedbackResponseDto>> GetFeedbacksByReportIdAsync(int reportId)
        {
            var allFeedbacks = await _uow.Feedbacks.GetAllAsync();
            var feedbacks = allFeedbacks.Where(f => f.ReportId == reportId).OrderByDescending(f => f.CreatedAt);

            var result = new List<FeedbackResponseDto>();
            foreach (var f in feedbacks)
            {
                var user = await _uow.Users.GetByIdAsync(f.UserId);
                result.Add(MapToResponse(f, user?.FullName ?? "Unknown"));
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
                result.Add(MapToResponse(f, user?.FullName ?? "Unknown"));
            }

            return result;
        }

        public async Task<FeedbackDetailDto> GetFeedbackDetailAsync(int feedbackId)
        {
            var feedback = await _uow.Feedbacks.GetByIdAsync(feedbackId);
            if (feedback == null)
                throw new InvalidOperationException("Feedback not found");

            var user = await _uow.Users.GetByIdAsync(feedback.UserId);
            var report = feedback.ReportId.HasValue
                ? await _uow.WasteReports.GetByIdAsync(feedback.ReportId.Value)
                : null;

            var detail = new FeedbackDetailDto
            {
                FeedbackId = feedback.FeedbackId,
                UserId = feedback.UserId,
                UserName = user?.FullName ?? "Unknown",
                Content = feedback.Content,
                Status = feedback.Status,
                CreatedAt = feedback.CreatedAt,
            };

            if (report != null)
            {
                detail.ReportId = report.ReportId;
                detail.ReportDescription = report.Description;
                detail.ReportStatus = report.Status;
                detail.ReportImageUrl = report.ImageUrl;
                detail.Latitude = report.Latitude;
                detail.Longitude = report.Longitude;
                detail.ReportCreatedAt = report.CreatedAt;
                detail.WasteTypeNames = report.WasteTypes?.Select(w => w.Name ?? "").ToList() ?? new List<string>();

                // Get collection request
                var collectionRequest = await _uow.CollectionRequests.GetByReportIdAsync(report.ReportId);
                if (collectionRequest != null)
                {
                    var enterprise = await _uow.Users.GetByIdAsync(collectionRequest.EnterpriseId);
                    detail.EnterpriseId = collectionRequest.EnterpriseId;
                    detail.EnterpriseName = enterprise?.FullName;

                    // Get collector assignment
                    var assignment = await _uow.CollectorAssignments.GetActiveByRequestIdAsync(collectionRequest.RequestId);
                    if (assignment != null)
                    {
                        var collector = await _uow.Users.GetByIdAsync(assignment.AssignedCollector);
                        detail.AssignmentId = assignment.AssignmentId;
                        detail.AssignmentStatus = assignment.Status;
                        detail.CollectorId = assignment.AssignedCollector;
                        detail.CollectorName = collector?.FullName;
                        detail.AssignedAt = assignment.AssignedAt;
                        detail.StartedAt = assignment.StartedAt;
                        detail.ArrivedAt = assignment.ArrivedAt;
                        detail.BeforeImageUrl = assignment.BeforeImageUrl;

                        // Get collection confirmation
                        var confirmation = await _uow.CollectionConfirmations.GetByAssignmentIdAsync(assignment.AssignmentId);
                        if (confirmation != null)
                        {
                            detail.ConfirmationId = confirmation.ConfirmationId;
                            detail.ConfirmationNote = confirmation.Note;
                            detail.ConfirmedAt = confirmation.ConfirmedAt;
                            detail.ConfirmationBeforeImageUrl = confirmation.BeforeImageUrl;
                            detail.ConfirmationAfterImageUrl = confirmation.AfterImageUrl;
                        }
                    }
                }
            }

            return detail;
        }

        public async Task<FeedbackResponseDto> ResolveFeedbackAsync(int feedbackId, ResolveFeedbackDto dto)
        {
            var feedback = await _uow.Feedbacks.GetByIdAsync(feedbackId);
            if (feedback == null)
                throw new InvalidOperationException("Feedback not found");

            // 1. Revert report status from Collected → Accepted
            if (dto.RevertReport && feedback.ReportId.HasValue)
            {
                var report = await _uow.WasteReports.GetByIdAsync(feedback.ReportId.Value);
                if (report != null && report.Status == "Collected")
                {
                    report.Status = "Accepted";
                    _uow.WasteReports.Update(report);
                }
            }

            // 2. Cancel collector's assignment
            if (dto.CancelAssignment && feedback.ReportId.HasValue)
            {
                var report = await _uow.WasteReports.GetByIdAsync(feedback.ReportId.Value);
                if (report != null)
                {
                    var collectionRequest = await _uow.CollectionRequests.GetByReportIdAsync(report.ReportId);
                    if (collectionRequest != null)
                    {
                        var assignment = await _uow.CollectorAssignments.GetActiveByRequestIdAsync(collectionRequest.RequestId);
                        if (assignment != null)
                        {
                            assignment.Status = "Cancelled";
                            _uow.CollectorAssignments.Update(assignment);
                        }
                    }
                }
            }

            // 3. Deactivate the collector
            if (dto.DeactivateCollector && feedback.ReportId.HasValue)
            {
                var report = await _uow.WasteReports.GetByIdAsync(feedback.ReportId.Value);
                if (report != null)
                {
                    var collectionRequest = await _uow.CollectionRequests.GetByReportIdAsync(report.ReportId);
                    if (collectionRequest != null)
                    {
                        var assignment = await _uow.CollectorAssignments.GetActiveByRequestIdAsync(collectionRequest.RequestId);
                        if (assignment != null)
                        {
                            var collector = await _uow.Users.GetByIdAsync(assignment.AssignedCollector);
                            if (collector != null)
                            {
                                collector.Status = "Inactive";
                                _uow.Users.Update(collector);
                            }
                        }
                    }
                }
            }

            // 4. Mark feedback as Resolved
            feedback.Status = "Resolved";
            _uow.Feedbacks.Update(feedback);
            await _uow.SaveChangesAsync();

            var user = await _uow.Users.GetByIdAsync(feedback.UserId);
            return MapToResponse(feedback, user?.FullName ?? "Unknown");
        }

        public async Task<FeedbackResponseDto> RejectFeedbackAsync(int feedbackId)
        {
            var feedback = await _uow.Feedbacks.GetByIdAsync(feedbackId);
            if (feedback == null)
                throw new InvalidOperationException("Feedback not found");

            feedback.Status = "Rejected";
            _uow.Feedbacks.Update(feedback);
            await _uow.SaveChangesAsync();

            var user = await _uow.Users.GetByIdAsync(feedback.UserId);
            return MapToResponse(feedback, user?.FullName ?? "Unknown");
        }

        private static FeedbackResponseDto MapToResponse(Feedback f, string userName) => new()
        {
            FeedbackId = f.FeedbackId,
            UserId = f.UserId,
            UserName = userName,
            ReportId = f.ReportId,
            Content = f.Content,
            Status = f.Status,
            CreatedAt = f.CreatedAt
        };
    }
}
