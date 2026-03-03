using BusinessLogicLayer.DTOs.Collection;
using BusinessLogicLayer.Services.Interface;
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
            // Get assignment with details
            var assignment = await _uow.CollectorAssignments.GetByIdWithDetailsAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Validate collector is the assigned collector
            if (assignment.AssignedCollector != collectorId)
            {
                throw new UnauthorizedAccessException("You can only complete your own assignments");
            }

            // Validate status is "Arrived" (must call Arrived first to upload before photo)
            if (!string.Equals(assignment.Status, "Arrived", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only complete collection when status is 'Arrived'. Please mark arrival first.");
            }

            // Validate before image exists (should be uploaded during Arrived step)
            if (string.IsNullOrWhiteSpace(assignment.BeforeImageUrl))
            {
                throw new InvalidOperationException("Before image not found. Please mark arrival and upload before photo first.");
            }

            // Validate after image is provided
            if (dto.AfterImage == null || dto.AfterImage.Length == 0)
            {
                throw new ArgumentException("After image is required to complete collection");
            }

            // TIME VALIDATION: Ensure collection takes reasonable time
            // Use ArrivedAt as baseline (actual collection start time)
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

            //var timeElapsed = DateTime.UtcNow - baselineTime;
                
            //    // Minimum time validation (2 minutes from arrival)
            //    // Rationale: After arriving, collector needs time to:
            //    // - Take before photo and assess situation (30 sec)
            //    // - Collect waste properly (1-2 min minimum)
            //    // - Clean up area (30 sec)
            //var minimumDuration = TimeSpan.FromMinutes(2);
            
            //if (timeElapsed < minimumDuration)
            //{
            //    var remainingMinutes = Math.Ceiling((minimumDuration - timeElapsed).TotalMinutes);
            //    throw new InvalidOperationException(
            //        $"Collection must take at least {minimumDuration.TotalMinutes} minutes. " +
            //        $"Please wait {remainingMinutes} more minute(s) before completing. " +
            //        $"This ensures quality and prevents fake completions."
            //    );
            //}

            // Maximum time warning (4 hours)
            // If taking too long, might indicate an issue
            //var maximumDuration = TimeSpan.FromHours(4);
            
            //if (timeElapsed > maximumDuration)
            //{
            //    // Log warning but still allow completion
            //    // Enterprise should review these cases
            //    Console.WriteLine($"WARNING: Assignment {assignmentId} took {timeElapsed.TotalHours:F2} hours to complete. " +
            //                    $"This is unusually long and should be reviewed.");
            //}

            // Save after image (before image already saved during Arrived step)
            var afterImageUrl = await SaveProofImageAsync(dto.AfterImage, "after");

            // Check if confirmation already exists
            var existingConfirmation = await _uow.CollectionConfirmations.GetByAssignmentIdAsync(assignmentId);
            if (existingConfirmation != null)
            {
                throw new InvalidOperationException("Collection confirmation already exists for this assignment");
            }

            // Create collection confirmation
            var confirmation = new DataAccessLayer.Models.Collectionconfirmation
            {
                AssignmentId = assignmentId,
                BeforeImageUrl = assignment.BeforeImageUrl!,  // From Arrived step
                AfterImageUrl = afterImageUrl,
                Note = dto.Note,
                ConfirmedAt = DateTime.UtcNow
            };

            await _uow.CollectionConfirmations.AddAsync(confirmation);

            // Update assignment status to "Completed"
            // Note: CompletedAt is tracked in confirmation.ConfirmedAt
            assignment.Status = "Completed";
            _uow.CollectorAssignments.Update(assignment);

            // Update collection request status to "Completed"
            var request = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
            if (request != null)
            {
                request.Status = "Completed";
                _uow.CollectionRequests.Update(request);

                // Update waste report status to "Collected"
                var report = await _uow.WasteReports.GetByIdAsync(request.ReportId);
                if (report != null)
                {
                    report.Status = "Collected";
                    _uow.WasteReports.Update(report);
                }
            }

            await _uow.SaveChangesAsync();

            return new CompleteCollectionResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                ConfirmationId = confirmation.ConfirmationId,
                Status = assignment.Status,
                CompletedAt = confirmation.ConfirmedAt,
                BeforeImageUrl = confirmation.BeforeImageUrl,
                AfterImageUrl = confirmation.AfterImageUrl,
                Note = confirmation.Note
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
