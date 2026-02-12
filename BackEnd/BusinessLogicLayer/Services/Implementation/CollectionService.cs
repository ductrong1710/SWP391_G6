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

            // Update assignment status to "OnTheWay"
            assignment.Status = "OnTheWay";
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
                StartedAt = DateTime.UtcNow,
                Latitude = assignment.Request?.Report?.Latitude,
                Longitude = assignment.Request?.Report?.Longitude,
                Address = assignment.Request?.Report?.Description
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

            // Validate status is "OnTheWay" or "Assigned" (allow skip start if needed)
            if (!string.Equals(assignment.Status, "OnTheWay", StringComparison.OrdinalIgnoreCase) 
                && !string.Equals(assignment.Status, "Assigned", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only complete collection when status is 'OnTheWay' or 'Assigned'");
            }

            // Validate proof image is provided
            if (dto.ProofImage == null || dto.ProofImage.Length == 0)
            {
                throw new ArgumentException("Proof image is required to complete collection");
            }

            // Save proof image
            var imageUrl = await SaveProofImageAsync(dto.ProofImage);

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
                ImageUrl = imageUrl,
                Note = dto.Note,
                ConfirmedAt = DateTime.UtcNow
            };

            await _uow.CollectionConfirmations.AddAsync(confirmation);

            // Update assignment status to "Completed"
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
                ProofImageUrl = confirmation.ImageUrl,
                Note = confirmation.Note
            };
        }

        private static async Task<string> SaveProofImageAsync(Microsoft.AspNetCore.Http.IFormFile image)
        {
            if (image == null || image.Length <= 0)
            {
                throw new ArgumentException("Invalid image file");
            }

            var ext = Path.GetExtension(image.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";

            var root = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "collection-proofs");
            Directory.CreateDirectory(root);

            var fullPath = Path.Combine(root, fileName);
            await using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                await image.CopyToAsync(stream);
            }

            return $"/uploads/collection-proofs/{fileName}";
        }
    }
}
