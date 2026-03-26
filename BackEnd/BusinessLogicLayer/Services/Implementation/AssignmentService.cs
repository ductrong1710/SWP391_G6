using BusinessLogicLayer.DTOs.Assignment;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;


namespace BusinessLogicLayer.Services.Implementation
{
    public class AssignmentService : IAssignmentService
    {
        private readonly IUnitOfWork _uow;

        private const int MaxOpenAssignmentsPerCollector = 5;


        public AssignmentService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<CollectorAssignmentResponseDto> AssignCollectorAsync(int requestId, int enterpriseId, AssignCollectorDto dto)
        {
            // Validate collection request exists
            var request = await _uow.CollectionRequests.GetByIdAsync(requestId);
            if (request == null)
            {
                throw new InvalidOperationException("Collection request not found");
            }

            // Validate request belongs to this enterprise
            if (request.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only assign collectors to your own collection requests");
            }

            // Validate collector exists and has Collector role
            var collector = await _uow.Users.GetByIdAsync(dto.CollectorId);
            if (collector == null)
            {
                throw new ArgumentException("Collector not found");
            }

            // Check if collector has "Collector" role
            if (!string.Equals(collector.Role?.RoleName, "Collector", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Selected user is not a Collector");
            }
            if (collector.CollectorProfile == null)
            {
                throw new InvalidOperationException("Collector profile not found");
            }

            if (collector.CollectorProfile.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException(
                    "This collector cannot receive the job because they are not in your managed area.");
            }

            if (!collector.CollectorProfile.IsAvailable)
            {
                throw new InvalidOperationException("Collector is currently offline and cannot receive new assignments");
            }


            var openAssignments = await _uow.CollectorAssignments.CountOpenAssignmentsByCollectorAsync(dto.CollectorId);
            if (openAssignments >= MaxOpenAssignmentsPerCollector)
            {
                throw new InvalidOperationException(
                    $"Collector has reached maximum capacity ({MaxOpenAssignmentsPerCollector} open assignments)."
                );
            }

            // Check if already assigned (active)
            var existingAssignments = await _uow.CollectorAssignments.GetByRequestIdAsync(requestId);
            if (existingAssignments.Any(x => x.AssignedCollector == dto.CollectorId && x.Status != "Cancelled"))
            {
                throw new InvalidOperationException("This collector is already assigned to this request");
            }

            // Block re-assigning a collector who was previously cancelled on this request (e.g. warned by admin)
            if (existingAssignments.Any(x => x.AssignedCollector == dto.CollectorId && x.Status == "Cancelled"))
            {
                throw new InvalidOperationException(
                    "This collector was previously removed from this request due to a complaint. Please assign a different collector.");
            }

            // Create assignment
            var assignment = new Collectorassignment
            {
                RequestId = requestId,
                AssignedCollector = dto.CollectorId,
                AssignedBy = enterpriseId,
                Status = "Assigned",
                AssignedAt = DateTime.UtcNow
            };

            await _uow.CollectorAssignments.AddAsync(assignment);

            // Update collection request status
            request.Status = "Assigned";
            _uow.CollectionRequests.Update(request);

            var notification = new Notification
            {
                UserId = dto.CollectorId,
                Content = $"You have been assigned to collect waste for request #{requestId}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _uow.Notifications.AddAsync(notification);

            await _uow.SaveChangesAsync();

            return new CollectorAssignmentResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                AssignedCollector = assignment.AssignedCollector,
                CollectorName = collector.FullName,
                AssignedBy = assignment.AssignedBy,
                AssignedByName = request.Enterprise?.FullName,
                Status = assignment.Status,
                AssignedAt = assignment.AssignedAt
            };
        }

        public async Task<CollectorAssignmentResponseDto> ReassignCollectorAsync(int assignmentId, int enterpriseId, ReassignCollectorDto dto)
        {
            // Get assignment
            var assignment = await _uow.CollectorAssignments.GetByIdAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Validate request belongs to this enterprise
            var request = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
            if (request == null)
            {
                throw new InvalidOperationException("Collection request not found");
            }

            if (request.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only reassign collectors for your own collection requests");
            }

            // Validate can only reassign when status is "Assigned" (not started yet)
            if (!string.Equals(assignment.Status, "Assigned", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only reassign collector when assignment status is 'Assigned'");
            }

            // Validate new collector exists and has Collector role
            var newCollector = await _uow.Users.GetByIdAsync(dto.NewCollectorId);
            if (newCollector == null)
            {
                throw new ArgumentException("New collector not found");
            }

            if (!string.Equals(newCollector.Role?.RoleName, "Collector", StringComparison.OrdinalIgnoreCase))
            {
                throw new ArgumentException("Selected user is not a Collector");
            }

            // Check if new collector is same as current
            if (assignment.AssignedCollector == dto.NewCollectorId)
            {
                throw new InvalidOperationException("New collector is the same as current collector");
            }
            if (newCollector.CollectorProfile == null)
            {
                throw new InvalidOperationException("Collector profile not found");
            }

            if (newCollector.CollectorProfile.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only reassign to collectors from your own enterprise");
            }

            if (!newCollector.CollectorProfile.IsAvailable)
            {
                throw new InvalidOperationException("Collector is currently offline and cannot receive new assignments");
            }


            // Update assignment
            assignment.AssignedCollector = dto.NewCollectorId;
            assignment.AssignedBy = enterpriseId;
            assignment.AssignedAt = DateTime.UtcNow;

            _uow.CollectorAssignments.Update(assignment);

            var notification = new Notification
            {
                UserId = dto.NewCollectorId,
                Content = $"You have been assigned to collect waste for request #{assignment.RequestId}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _uow.Notifications.AddAsync(notification);

            await _uow.SaveChangesAsync();

            return new CollectorAssignmentResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                AssignedCollector = assignment.AssignedCollector,
                CollectorName = newCollector.FullName,
                AssignedBy = assignment.AssignedBy,
                AssignedByName = request.Enterprise?.FullName,
                Status = assignment.Status,
                AssignedAt = assignment.AssignedAt
            };
        }

        public async Task<CancelAssignmentResponseDto> CancelAssignmentAsync(int assignmentId, int userId, string userRole)
        {
            // Get assignment
            var assignment = await _uow.CollectorAssignments.GetByIdAsync(assignmentId);
            if (assignment == null)
            {
                throw new InvalidOperationException("Assignment not found");
            }

            // Validate can only cancel when status is "Assigned" (not started yet)
            if (!string.Equals(assignment.Status, "Assigned", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Can only cancel assignment when status is 'Assigned'");
            }

            // Role-based authorization
            if (string.Equals(userRole, "Enterprise", StringComparison.OrdinalIgnoreCase))
            {
                // Enterprise can only cancel assignments for their own requests
                var request = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
                if (request == null || request.EnterpriseId != userId)
                {
                    throw new UnauthorizedAccessException("You can only cancel assignments for your own collection requests");
                }
            }
            else if (string.Equals(userRole, "Collector", StringComparison.OrdinalIgnoreCase))
            {
                // Collector can only cancel assignments assigned to them
                if (assignment.AssignedCollector != userId)
                {
                    throw new UnauthorizedAccessException("You can only cancel assignments assigned to you");
                }
            }
            else
            {
                throw new UnauthorizedAccessException("Only Enterprise or Collector can cancel assignments");
            }

            // Update assignment status
            assignment.Status = "Cancelled";
            _uow.CollectorAssignments.Update(assignment);

            // Update collection request status back to Pending
            var collectionRequest = await _uow.CollectionRequests.GetByIdAsync(assignment.RequestId);
            if (collectionRequest != null)
            {
                collectionRequest.Status = "Pending";
                _uow.CollectionRequests.Update(collectionRequest);
            }

            await _uow.SaveChangesAsync();

            return new CancelAssignmentResponseDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                Status = assignment.Status
            };
        }

        // View methods - Enterprise
        public async Task<IEnumerable<AssignmentDto>> GetAllAssignmentsByEnterpriseAsync(int enterpriseId)
        {
            var assignments = await _uow.CollectorAssignments.GetByEnterpriseIdAsync(enterpriseId);

            return assignments.Select(a => new AssignmentDto
            {
                AssignmentId = a.AssignmentId,
                RequestId = a.RequestId,
                AssignedCollector = a.AssignedCollector,
                CollectorName = a.AssignedCollectorNavigation?.FullName,
                CollectorEmail = a.AssignedCollectorNavigation?.Email,
                CollectorPhone = a.AssignedCollectorNavigation?.Phone,
                AssignedBy = a.AssignedBy,
                AssignedByName = a.AssignedByNavigation?.FullName,
                Status = a.Status,
                AssignedAt = a.AssignedAt,
                StartedAt = a.StartedAt,
                ArrivedAt = a.ArrivedAt,
                CompletedAt = a.Collectionconfirmation?.ConfirmedAt,  // From confirmation
                BeforeImageUrl = a.BeforeImageUrl,

                // Collection request info
                RequestStatus = a.Request?.Status,
                RequestCreatedAt = a.Request?.CreatedAt,

                // Waste report info
                ReportId = a.Request?.ReportId ?? 0,

                WasteTypeName = a.Request?.Report?.WasteTypes != null
                    ? string.Join(", ", a.Request.Report.WasteTypes.Select(wt => wt.Name))
                    : string.Empty,

                ReportImageUrl = a.Request?.Report?.ImageUrl,
                Latitude = a.Request?.Report?.Latitude,
                Longitude = a.Request?.Report?.Longitude,
                ReportDescription = a.Request?.Report?.Description,
                ReportStatus = a.Request?.Report?.Status,

                // Citizen info
                CitizenId = a.Request?.Report?.SubmittedBy ?? 0,
                CitizenName = a.Request?.Report?.SubmittedByNavigation?.FullName
            }).ToList();
        }

        public async Task<IEnumerable<AssignmentHistoryDto>> GetAssignmentHistoryByRequestAsync(int requestId, int enterpriseId)
        {
            // Validate request exists and belongs to this enterprise
            var request = await _uow.CollectionRequests.GetByIdAsync(requestId);
            if (request == null)
            {
                throw new InvalidOperationException("Collection request not found");
            }

            if (request.EnterpriseId != enterpriseId)
            {
                throw new UnauthorizedAccessException("You can only view assignments for your own collection requests");
            }

            // Get assignments for this request
            var assignments = await _uow.CollectorAssignments.GetByRequestIdAsync(requestId);

            return assignments.Select(a => new AssignmentHistoryDto
            {
                AssignmentId = a.AssignmentId,
                AssignedCollector = a.AssignedCollector,
                CollectorName = a.AssignedCollectorNavigation?.FullName,
                CollectorPhone = a.AssignedCollectorNavigation?.Phone,
                AssignedBy = a.AssignedBy,
                AssignedByName = a.AssignedByNavigation?.FullName,
                Status = a.Status,
                AssignedAt = a.AssignedAt
            }).ToList();
        }

        // View methods - Collector
        public async Task<IEnumerable<MyAssignmentDto>> GetMyAssignmentsAsync(int collectorId)
        {
            var assignments = await _uow.CollectorAssignments.GetByCollectorIdAsync(collectorId);

            return assignments.Select(a => new MyAssignmentDto
            {
                AssignmentId = a.AssignmentId,
                RequestId = a.RequestId,
                Status = a.Status ?? string.Empty,
                AssignedAt = a.AssignedAt,
                StartedAt = a.StartedAt,
                ArrivedAt = a.ArrivedAt,
                CompletedAt = a.Collectionconfirmation?.ConfirmedAt,

                BeforeImageUrl = a.BeforeImageUrl,
                AfterImageUrl = a.Collectionconfirmation?.AfterImageUrl,
                CompletionNote = a.Collectionconfirmation?.Note,

                EnterpriseId = a.Request?.EnterpriseId ?? 0,
                EnterpriseName = a.Request?.Enterprise?.FullName,
                EnterprisePhone = a.Request?.Enterprise?.Phone,

                ReportId = a.Request?.ReportId ?? 0,
                ReportImageUrl = a.Request?.Report?.ImageUrl,

                WasteTypeIds = a.Request?.Report?.WasteTypes?.Select(wt => wt.WasteTypeId).ToList()
                    ?? new List<int>(),
                WasteTypeName = a.Request?.Report?.WasteTypes != null
                    ? string.Join(", ", a.Request.Report.WasteTypes.Select(wt => wt.Name))
                    : string.Empty,
                WasteItems = a.Request?.Report?.WasteTypes?.Select(wt => new EstimatedWasteItemDto
                {
                    WasteTypeId = wt.WasteTypeId,
                    WasteTypeName = wt.Name
                }).ToList() ?? new List<EstimatedWasteItemDto>(),

                Latitude = a.Request?.Report != null ? (double)a.Request.Report.Latitude : 0,
                Longitude = a.Request?.Report != null ? (double)a.Request.Report.Longitude : 0,
                Description = a.Request?.Report?.Description,

                ReportStatus = a.Request?.Report?.Status,
                ReportCreatedAt = a.Request?.Report?.CreatedAt,

                CitizenName = a.Request?.Report?.SubmittedByNavigation?.FullName,
                CitizenPhone = a.Request?.Report?.SubmittedByNavigation?.Phone,

                Note = a.Request?.Note,
                IssueReport = a.Request?.IssueReport,
                IssueReason = a.Request?.IssueReason,
                IssueImageUrl = a.Request?.IssueImageUrl,

                TotalCollectedWeight = (decimal)(a.Collectionconfirmation?.CollectionDetails?.Sum(d => d.ActualWeight) ?? 0),

                CollectedWasteSummary = a.Collectionconfirmation?.CollectionDetails != null
                    && a.Collectionconfirmation.CollectionDetails.Any()
                    ? string.Join(", ", a.Collectionconfirmation.CollectionDetails.Select(d =>
                        $"{d.WasteType?.Name ?? $"Type {d.WasteTypeId}"}: {d.ActualWeight:0.##} kg"))
                    : null
            }).ToList();
        }

        public async Task<MyAssignmentDto?> GetAssignmentDetailAsync(int assignmentId, int collectorId)
        {
            var assignment = await _uow.CollectorAssignments.GetByIdWithDetailsAsync(assignmentId);
            if (assignment == null)
            {
                return null;
            }

            if (assignment.AssignedCollector != collectorId)
            {
                throw new UnauthorizedAccessException("You can only view your own assignments");
            }

            return new MyAssignmentDto
            {
                AssignmentId = assignment.AssignmentId,
                RequestId = assignment.RequestId,
                Status = assignment.Status ?? string.Empty,
                AssignedAt = assignment.AssignedAt,
                StartedAt = assignment.StartedAt,
                ArrivedAt = assignment.ArrivedAt,
                CompletedAt = assignment.Collectionconfirmation?.ConfirmedAt,

                BeforeImageUrl = assignment.BeforeImageUrl,
                AfterImageUrl = assignment.Collectionconfirmation?.AfterImageUrl,
                CompletionNote = assignment.Collectionconfirmation?.Note,

                EnterpriseId = assignment.Request?.EnterpriseId ?? 0,
                EnterpriseName = assignment.Request?.Enterprise?.FullName,
                EnterprisePhone = assignment.Request?.Enterprise?.Phone,

                ReportId = assignment.Request?.ReportId ?? 0,
                ReportImageUrl = assignment.Request?.Report?.ImageUrl,

                WasteTypeIds = assignment.Request?.Report?.WasteTypes?.Select(wt => wt.WasteTypeId).ToList()
                    ?? new List<int>(),
                WasteTypeName = assignment.Request?.Report?.WasteTypes != null
                    ? string.Join(", ", assignment.Request.Report.WasteTypes.Select(wt => wt.Name))
                    : string.Empty,
                WasteItems = assignment.Request?.Report?.WasteTypes?.Select(wt => new EstimatedWasteItemDto
                {
                    WasteTypeId = wt.WasteTypeId,
                    WasteTypeName = wt.Name
                }).ToList() ?? new List<EstimatedWasteItemDto>(),

                Latitude = assignment.Request?.Report != null ? (double)assignment.Request.Report.Latitude : 0,
                Longitude = assignment.Request?.Report != null ? (double)assignment.Request.Report.Longitude : 0,
                Description = assignment.Request?.Report?.Description,

                ReportStatus = assignment.Request?.Report?.Status,
                ReportCreatedAt = assignment.Request?.Report?.CreatedAt,

                CitizenName = assignment.Request?.Report?.SubmittedByNavigation?.FullName,
                CitizenPhone = assignment.Request?.Report?.SubmittedByNavigation?.Phone,

                Note = assignment.Request?.Note,
                IssueReport = assignment.Request?.IssueReport,
                IssueReason = assignment.Request?.IssueReason,
                IssueImageUrl = assignment.Request?.IssueImageUrl,

                TotalCollectedWeight = (decimal)(assignment.Collectionconfirmation?.CollectionDetails?.Sum(d => d.ActualWeight) ?? 0),

                CollectedWasteSummary = assignment.Collectionconfirmation?.CollectionDetails != null
                    && assignment.Collectionconfirmation.CollectionDetails.Any()
                    ? string.Join(", ", assignment.Collectionconfirmation.CollectionDetails.Select(d =>
                        $"{d.WasteType?.Name ?? $"Type {d.WasteTypeId}"}: {d.ActualWeight:0.##} kg"))
                    : null
            };
        }


    }
}