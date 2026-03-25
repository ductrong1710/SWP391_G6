using BusinessLogicLayer.DTOs.Feedback;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class FeedbackService : IFeedbackService
    {
        private const int WarningThreshold = 4; // Auto-deactivate at 4 points
        private const int WarnPoints = 1;        // Cảnh cáo = +1
        private const int ReassignPoints = 2;    // Giao lại = +2
        private const int ComplaintRewardPoints = 10; // Citizen reward for valid complaint

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

            // Anti-spam: block if there's already a Pending feedback for this report
            var allFeedbacks = await _uow.Feedbacks.GetAllAsync();
            var hasPending = allFeedbacks.Any(f => f.ReportId == dto.ReportId && f.Status == "Pending");
            if (hasPending)
                throw new InvalidOperationException("A complaint for this report is already pending review. Please wait for admin resolution before submitting a new one.");

            var feedback = new Feedback
            {
                UserId = userId,
                ReportId = dto.ReportId,
                Content = dto.Content,
                ImageUrl = dto.ImageUrl,
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
                FeedbackImageUrl = feedback.ImageUrl,
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

                    // Get collector assignment (latest, any status)
                    var allAssignments = await _uow.CollectorAssignments.GetByRequestIdAsync(collectionRequest.RequestId);
                    var assignment = allAssignments.FirstOrDefault();
                    if (assignment != null)
                    {
                        var collector = await _uow.Users.GetByIdAsync(assignment.AssignedCollector);
                        detail.AssignmentId = assignment.AssignmentId;
                        detail.AssignmentStatus = assignment.Status;
                        detail.CollectorId = assignment.AssignedCollector;
                        detail.CollectorName = collector?.FullName;
                        detail.CollectorWarningCount = collector?.WarningCount ?? 0;
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

            var now = DateTime.UtcNow;
            var citizenId = feedback.UserId;
            int? collectorId = null;
            int? enterpriseId = null;
            int reportId = feedback.ReportId ?? 0;
            string action = dto.Action?.ToLower() ?? "warn";

            // Find collector and enterprise
            if (feedback.ReportId.HasValue)
            {
                var report = await _uow.WasteReports.GetByIdAsync(feedback.ReportId.Value);
                if (report != null)
                {
                    var collectionRequest = await _uow.CollectionRequests.GetByReportIdAsync(report.ReportId);
                    if (collectionRequest != null)
                    {
                        enterpriseId = collectionRequest.EnterpriseId;

                        var assignments = await _uow.CollectorAssignments.GetByRequestIdAsync(collectionRequest.RequestId);
                        var assignment = assignments.FirstOrDefault();
                        if (assignment != null)
                        {
                            collectorId = assignment.AssignedCollector;

                            if (action == "reassign")
                            {
                                // ---- NEW REDO LOGIC ----
                                // 1. Revert report status: Collected/Completed → Accepted
                                if (report.Status == "Collected" || report.Status == "Completed")
                                {
                                    report.Status = "Accepted";
                                    _uow.WasteReports.Update(report);
                                }

                                // 2. Keep the assignment but revert it to "Assigned" so they have to start over
                                assignment.Status = "Assigned";
                                assignment.StartedAt = null;
                                assignment.ArrivedAt = null;
                                assignment.BeforeImageUrl = null;
                                _uow.CollectorAssignments.Update(assignment);

                                // 3. Revert Collection Request status to Assigned
                                collectionRequest.Status = "Assigned";
                                _uow.CollectionRequests.Update(collectionRequest);

                                // 4. Delete the old Confirmation and Details if they exist
                                var confirmation = await _uow.CollectionConfirmations.GetByAssignmentIdAsync(assignment.AssignmentId);
                                if (confirmation != null)
                                {
                                    var details = await _uow.CollectionDetails.FindAsync(d => d.ConfirmationId == confirmation.ConfirmationId);
                                    foreach (var d in details)
                                    {
                                        _uow.CollectionDetails.Remove(d);
                                    }
                                    _uow.CollectionConfirmations.Remove(confirmation);
                                }

                                // 5. Reverse previously awarded citizen points for this report
                                var allTx = await _uow.RewardTransactions.GetAllAsync();
                                var earnedTx = allTx
                                    .Where(t => t.ReportId == report.ReportId && t.Type == "Earned")
                                    .ToList();

                                if (earnedTx.Any())
                                {
                                    int totalEarned = earnedTx.Sum(t => t.Points);
                                    var citizen = await _uow.Users.GetByIdAsync(report.SubmittedBy);
                                    if (citizen != null && totalEarned > 0)
                                    {
                                        citizen.TotalPoints = Math.Max(0, citizen.TotalPoints - totalEarned);
                                        _uow.Users.Update(citizen);

                                        // Create reversal transaction for audit
                                        await _uow.RewardTransactions.AddAsync(new Rewardtransaction
                                        {
                                            UserId = citizen.UserId,
                                            ReportId = report.ReportId,
                                            Points = -totalEarned,
                                            Type = "Reversed",
                                            Description = $"Points reversed due to complaint on report #{report.ReportId}",
                                            CreatedAt = now
                                        });

                                        // Notify citizen about point reversal
                                        await _uow.Notifications.AddAsync(new Notification
                                        {
                                            UserId = citizen.UserId,
                                            Content = $"Your {totalEarned} reward points for report #{report.ReportId} have been reversed due to a valid complaint. The collector has been forced to re-clean the area.",
                                            IsRead = false,
                                            CreatedAt = now
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Add warning points to collector
            if (collectorId.HasValue)
            {
                var collector = await _uow.Users.GetByIdAsync(collectorId.Value);
                if (collector != null)
                {
                    int points = action == "reassign" ? ReassignPoints : WarnPoints;
                    collector.WarningCount += points;

                    // Auto-deactivate if >= threshold
                    bool autoDeactivated = false;
                    if (collector.WarningCount >= WarningThreshold)
                    {
                        collector.Status = "Inactive";
                        autoDeactivated = true;
                    }

                    _uow.Users.Update(collector);

                    // Notify collector
                    string collectorMsg = action == "reassign"
                        ? $"URGENT: You received a warning (+{points} pts, total: {collector.WarningCount}/{WarningThreshold}) for report #{reportId}. Your collection was rejected due to a valid complaint. You MUST return to the location and re-clean the area."
                        : $"You received a warning (+{points} pt, total: {collector.WarningCount}/{WarningThreshold}) for report #{reportId}. Reason: {dto.AdminNote}";

                    if (autoDeactivated)
                    {
                        collectorMsg += " Your account has been DEACTIVATED due to reaching the warning threshold.";
                    }

                    await _uow.Notifications.AddAsync(new Notification
                    {
                        UserId = collectorId.Value,
                        Content = collectorMsg,
                        IsRead = false,
                        CreatedAt = now
                    });
                }
            }

            // Notify enterprise (for reassign only)
            if (action == "reassign" && enterpriseId.HasValue)
            {
                await _uow.Notifications.AddAsync(new Notification
                {
                    UserId = enterpriseId.Value,
                    Content = $"WARNING: Collector assigned to Report #{reportId} failed to clean properly. The assignment has been forced to REDO. Please monitor their progress.",
                    IsRead = false,
                    CreatedAt = now
                });
            }

            // Notify citizen
            await _uow.Notifications.AddAsync(new Notification
            {
                UserId = citizenId,
                Content = action == "reassign"
                    ? $"Your complaint about report #{reportId} has been resolved. The report will be reassigned to a new collector. You earned +10 reward points!"
                    : $"Your complaint about report #{reportId} has been resolved. The collector has been warned. You earned +10 reward points!",
                IsRead = false,
                CreatedAt = now
            });

            // Reward citizen +10 points for valid complaint
            var complainant = await _uow.Users.GetByIdAsync(citizenId);
            if (complainant != null)
            {
                complainant.TotalPoints += ComplaintRewardPoints;
                _uow.Users.Update(complainant);

                await _uow.RewardTransactions.AddAsync(new Rewardtransaction
                {
                    UserId = citizenId,
                    ReportId = reportId > 0 ? reportId : null,
                    Points = ComplaintRewardPoints,
                    Type = "Earned",
                    Description = $"Reward for valid complaint on report #{reportId}",
                    CreatedAt = now
                });
            }

            // Mark feedback as Resolved and save admin note
            feedback.Status = "Resolved";
            feedback.ResolutionNote = dto.AdminNote;
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

            // Notify citizen
            await _uow.Notifications.AddAsync(new Notification
            {
                UserId = feedback.UserId,
                Content = $"Your complaint about report #{feedback.ReportId} has been reviewed and was found to be invalid.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            });

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
            ImageUrl = f.ImageUrl,
            ResolutionNote = f.ResolutionNote,
            CreatedAt = f.CreatedAt
        };
    }
}
