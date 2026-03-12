using BusinessLogicLayer.DTOs.Collection;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    /// <summary>
    /// Service for handling collection process (Collector perspective)
    /// </summary>
    public class CollectionService : ICollectionService
    {
        private readonly IUnitOfWork _uow;

        public CollectionService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<DeclineAssignmentResponseDto> DeclineAssignmentAsync(int assignmentId, int collectorId, DeclineAssignmentDto dto)
        {
            // Get assignment
            var assignment = await _uow.CollectorAssignments.GetByIdAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Validate collector is the assigned collector
            if (assignment.AssignedCollector != collectorId)
            {
                throw new UnauthorizedAccessException("You can only decline your own assignments");
            }

            // Validate status is "Assigned" (not started yet)
            if (!string.Equals(assignment.Status, "Assigned", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only decline assignment when status is 'Assigned'. Cannot decline after starting collection.");
            }

            // Validate reason is provided
            if (string.IsNullOrWhiteSpace(dto.Reason))
            {
                throw new ArgumentException("Reason is required to decline assignment");
            }

            // Update assignment status to "Declined"
            assignment.Status = "Declined";
            _uow.CollectorAssignments.Update(assignment);

            // Update collection request status back to "Pending" so Enterprise can reassign
            var request = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
            if (request != null)
            {
                request.Status = "Pending";
                _uow.CollectionRequests.Update(request);
            }

            await _uow.SaveChangesAsync();

            return new DeclineAssignmentResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                Status = assignment.Status,
                Reason = dto.Reason,
                DeclinedAt = DateTime.UtcNow
            };
        }

        public async Task<StartCollectionResponseDto> StartCollectionAsync(int assignmentId, int collectorId)
        {
            // Get assignment with details
            var assignment = await _uow.CollectorAssignments.GetByIdWithDetailsAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Validate collector is the assigned collector
            if (assignment.AssignedCollector != collectorId)
            {
                throw new UnauthorizedAccessException("You can only start your own assignments");
            }

            // Validate status is "Assigned"
            if (!string.Equals(assignment.Status, "Assigned", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only start collection when status is 'Assigned'");
            }

            // Update assignment status to "OnTheWay" and set StartedAt
            var startedAt = DateTime.UtcNow;
            assignment.Status = "OnTheWay";
            assignment.StartedAt = startedAt;  // ✅ Track actual start time
            _uow.CollectorAssignments.Update(assignment);

            // Update collection request status to "InProgress"
            var request = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
            if (request != null)
            {
                request.Status = "InProgress";
                _uow.CollectionRequests.Update(request);
            }

            await _uow.SaveChangesAsync();

            return new StartCollectionResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                Status = assignment.Status,
                StartedAt = startedAt,
                Latitude = assignment.Request?.Report?.Latitude,
                Longitude = assignment.Request?.Report?.Longitude,
                Address = assignment.Request?.Report?.Description
            };
        }

        public async Task<ArrivedAtLocationResponseDto> ArrivedAtLocationAsync(int assignmentId, int collectorId, ArrivedAtLocationDto dto)
        {
            // Get assignment with details
            var assignment = await _uow.CollectorAssignments.GetByIdWithDetailsAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Validate collector is the assigned collector
            if (assignment.AssignedCollector != collectorId)
            {
                throw new UnauthorizedAccessException("You can only mark arrival for your own assignments");
            }

            // Validate status is "OnTheWay"
            if (!string.Equals(assignment.Status, "OnTheWay", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only mark arrival when status is 'OnTheWay'. Please start collection first.");
            }

            // Validate before image is provided
            if (dto.BeforeImage == null || dto.BeforeImage.Length == 0)
            {
                throw new ArgumentException("Before image is required when marking arrival");
            }

            // Save before image
            var beforeImageUrl = await SaveProofImageAsync(dto.BeforeImage, "before");

            // Update assignment status to "Arrived" and set ArrivedAt & BeforeImageUrl
            var arrivedAt = DateTime.UtcNow;
            assignment.Status = "Arrived";
            assignment.ArrivedAt = arrivedAt;
            assignment.BeforeImageUrl = beforeImageUrl;
            _uow.CollectorAssignments.Update(assignment);

            await _uow.SaveChangesAsync();

            return new ArrivedAtLocationResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                Status = assignment.Status,
                ArrivedAt = arrivedAt,
                BeforeImageUrl = beforeImageUrl,
                Note = dto.Note,
                Latitude = assignment.Request?.Report?.Latitude,
                Longitude = assignment.Request?.Report?.Longitude
            };
        }

        public async Task<ReportIssueResponseDto> ReportIssueAsync(int assignmentId, int collectorId, ReportIssueDto dto)
        {
            // Get assignment with details
            var assignment = await _uow.CollectorAssignments.GetByIdWithDetailsAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Validate collector is the assigned collector
            if (assignment.AssignedCollector != collectorId)
            {
                throw new UnauthorizedAccessException("You can only report issues for your own assignments");
            }

            // Validate status is "OnTheWay" or "Arrived" (collector must have started the collection)
            if (!string.Equals(assignment.Status, "OnTheWay", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(assignment.Status, "Arrived", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only report issue when status is 'OnTheWay' or 'Arrived'. Please start collection first.");
            }

            // Validate issue type
            if (string.IsNullOrWhiteSpace(dto.IssueType))
            {
                throw new ArgumentException("Issue type is required");
            }

            // Validate description
            if (string.IsNullOrWhiteSpace(dto.Description))
            {
                throw new ArgumentException("Description is required to report issue");
            }

            // Validate issue type is valid
            var validIssueTypes = new[] 
            { 
                CollectionIssueTypes.WasteNotFound,
                CollectionIssueTypes.WrongAddress,
                CollectionIssueTypes.WasteTypeMismatch,
                CollectionIssueTypes.CitizenUnavailable,
                CollectionIssueTypes.Other
            };

            if (!validIssueTypes.Contains(dto.IssueType, StringComparer.OrdinalIgnoreCase))
            {
                throw new ArgumentException($"Invalid issue type. Valid types: {string.Join(", ", validIssueTypes)}");
            }

            // Save proof image if provided
            string? proofImageUrl = null;
            if (dto.ProofImage != null && dto.ProofImage.Length > 0)
            {
                proofImageUrl = await SaveIssueProofImageAsync(dto.ProofImage);
            }

            // Update assignment status to "Issue"
            assignment.Status = "Issue";
            _uow.CollectorAssignments.Update(assignment);

            // Update collection request status to "Issue"
            var request = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
            if (request != null)
            {
                request.Status = "Issue";
                _uow.CollectionRequests.Update(request);
            }

            await _uow.SaveChangesAsync();

            // Note: Issue details (type, description, image) should be stored in a separate table
            // For now, we're just changing the status. Enterprise will need to contact collector
            // or create a CollectionIssue table in future

            return new ReportIssueResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                Status = assignment.Status,
                IssueType = dto.IssueType,
                Description = dto.Description,
                ProofImageUrl = proofImageUrl,
                ReportedAt = DateTime.UtcNow
            };
        }

        public async Task<CompleteCollectionResponseDto> CompleteCollectionAsync(int assignmentId, int collectorId, CompleteCollectionDto dto)
        {
            var assignment = await _uow.CollectorAssignments.GetByIdWithDetailsAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            if (assignment.AssignedCollector != collectorId)
            {
                throw new UnauthorizedAccessException("You can only complete your own assignments");
            }

            if (!string.Equals(assignment.Status, "Arrived", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only complete collection when status is 'Arrived'. Please mark arrival first.");
            }

            if (string.IsNullOrWhiteSpace(assignment.BeforeImageUrl))
            {
                throw new InvalidOperationException("Before image not found. Please mark arrival and upload before photo first.");
            }

            if (dto.AfterImage == null || dto.AfterImage.Length == 0)
            {
                throw new ArgumentException("After image is required to complete collection");
            }

            if (dto.ActualWeights == null || !dto.ActualWeights.Any())
            {
                throw new ArgumentException("ActualWeights is required. Please provide at least one waste type with weight.");
            }

            var validWeightItems = dto.ActualWeights
                .Where(x => x != null && x.WasteTypeId > 0 && x.Weight > 0)
                .ToList();

            Console.WriteLine($"[CompleteCollection] AssignmentId={assignmentId}, CollectorId={collectorId}");
            Console.WriteLine($"[CompleteCollection] dto.ActualWeights.Count = {dto.ActualWeights.Count}");

            foreach (var item in dto.ActualWeights)
            {
                Console.WriteLine($"[CompleteCollection] WasteTypeId={item.WasteTypeId}, Weight={item.Weight}");
            }

            if (!validWeightItems.Any())
            {
                throw new ArgumentException("At least one valid ActualWeight is required with Weight > 0.");
            }

            DateTime baselineTime;
            if (assignment.ArrivedAt.HasValue)
            {
                baselineTime = assignment.ArrivedAt.Value;
            }
            else if (assignment.StartedAt.HasValue)
            {
                baselineTime = assignment.StartedAt.Value;
            }
            else if (assignment.AssignedAt.HasValue)
            {
                baselineTime = assignment.AssignedAt.Value;
            }
            else
            {
                throw new InvalidOperationException("Cannot validate time: no baseline timestamp available");
            }

            var afterImageUrl = await SaveProofImageAsync(dto.AfterImage, "after");

            var existingConfirmation = await _uow.CollectionConfirmations.GetByAssignmentIdAsync(assignmentId);
            if (existingConfirmation != null)
            {
                throw new InvalidOperationException("Collection confirmation already exists for this assignment");
            }

            var confirmation = new DataAccessLayer.Models.Collectionconfirmation
            {
                AssignmentId = assignmentId,
                BeforeImageUrl = assignment.BeforeImageUrl!,
                AfterImageUrl = afterImageUrl,
                Note = dto.Note,
                ConfirmedAt = DateTime.UtcNow
            };

            await _uow.CollectionConfirmations.AddAsync(confirmation);
            await _uow.SaveChangesAsync();

            int pointsEarned = 0;

            foreach (var weightItem in validWeightItems)
            {
                var wasteType = await _uow.WasteTypes.GetByIdAsync(weightItem.WasteTypeId);
                if (wasteType == null)
                {
                    throw new InvalidOperationException($"Waste type not found: {weightItem.WasteTypeId}");
                }

                var earned = (int)Math.Round(wasteType.RewardPoints * weightItem.Weight);
                pointsEarned += earned;

                Console.WriteLine(
                    $"[CompleteCollection] WasteType={wasteType.Name}, RewardPoints={wasteType.RewardPoints}, Weight={weightItem.Weight}, Earned={earned}"
                );

                var detail = new DataAccessLayer.Models.CollectionDetail
                {
                    ConfirmationId = confirmation.ConfirmationId,
                    WasteTypeId = wasteType.WasteTypeId,
                    ActualWeight = weightItem.Weight
                };

                await _uow.CollectionDetails.AddAsync(detail);
            }

            assignment.Status = "Completed";
            _uow.CollectorAssignments.Update(assignment);

            var request = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
            if (request == null)
            {
                throw new InvalidOperationException("Collection request not found");
            }

            request.Status = "Completed";
            _uow.CollectionRequests.Update(request);

            var report = await _uow.WasteReports.GetByIdAsync(request.ReportId);
            if (report == null)
            {
                throw new InvalidOperationException("Waste report not found");
            }

            report.Status = "Collected";
            _uow.WasteReports.Update(report);

            if (pointsEarned <= 0)
            {
                throw new InvalidOperationException("Calculated reward points is 0. Please verify waste type reward points and actual weights.");
            }

            var citizen = await _uow.Users.GetByIdAsync(report.SubmittedBy);
            if (citizen == null)
            {
                throw new InvalidOperationException($"Citizen not found. SubmittedBy = {report.SubmittedBy}");
            }

            citizen.TotalPoints += pointsEarned;
            _uow.Users.Update(citizen);

            var rewardTx = new DataAccessLayer.Models.Rewardtransaction
            {
                UserId = citizen.UserId,
                ReportId = report.ReportId,
                Points = pointsEarned,
                Type = "Earned",
                Description = $"Earned points for waste collection (Request #{request.RequestId})",
                CreatedAt = DateTime.UtcNow
            };

            await _uow.RewardTransactions.AddAsync(rewardTx);

            var notification = new Notification
            {
                UserId = citizen.UserId,
                Content = $"Your reported waste has been successfully collected! You have earned {pointsEarned} reward points.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _uow.Notifications.AddAsync(notification);

            await _uow.SaveChangesAsync();

            Console.WriteLine($"[CompleteCollection] SUCCESS - CitizenId={citizen.UserId}, PointsEarned={pointsEarned}, NewTotalPoints={citizen.TotalPoints}");

            return new CompleteCollectionResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                ConfirmationId = confirmation.ConfirmationId,
                Status = assignment.Status,
                CompletedAt = confirmation.ConfirmedAt,
                BeforeImageUrl = confirmation.BeforeImageUrl,
                AfterImageUrl = confirmation.AfterImageUrl,
                Note = confirmation.Note,
                EarnedPoints = pointsEarned
            };
        }

        private static async Task<string> SaveProofImageAsync(Microsoft.AspNetCore.Http.IFormFile image, string prefix = "proof")
        {
            if (image == null || image.Length <= 0)
            {
                throw new ArgumentException("Invalid image file");
            }

            var ext = Path.GetExtension(image.FileName);
            var fileName = $"{prefix}_{Guid.NewGuid():N}{ext}";  // before_xxx.jpg or after_xxx.jpg

            var root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "collection-proofs");
            Directory.CreateDirectory(root);

            var fullPath = Path.Combine(root, fileName);
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/uploads/collection-proofs/{fileName}";
        }

        private static async Task<string> SaveIssueProofImageAsync(Microsoft.AspNetCore.Http.IFormFile image)
        {
            if (image == null || image.Length <= 0)
            {
                throw new ArgumentException("Invalid image file");
            }

            var ext = Path.GetExtension(image.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";

            var root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "issue-proofs");
            Directory.CreateDirectory(root);

            var fullPath = Path.Combine(root, fileName);
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/uploads/issue-proofs/{fileName}";
        }
    }
}
