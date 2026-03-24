namespace BusinessLogicLayer.DTOs.Feedback
{
    public class CreateFeedbackDto
    {
        public int ReportId { get; set; }
        public string Content { get; set; } = null!;
        /// <summary>
        /// Image URL (set by controller after saving the uploaded file)
        /// </summary>
        public string? ImageUrl { get; set; }
    }

    public class FeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int? ReportId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? Status { get; set; }
        public string? ImageUrl { get; set; }
        public DateTime? CreatedAt { get; set; }
    }

    /// <summary>
    /// Detailed feedback view for admin with full context
    /// </summary>
    public class FeedbackDetailDto
    {
        // Feedback info
        public int FeedbackId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string? Status { get; set; }
        public string? FeedbackImageUrl { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Report info
        public int ReportId { get; set; }
        public string? ReportDescription { get; set; }
        public string? ReportStatus { get; set; }
        public string? ReportImageUrl { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public DateTime? ReportCreatedAt { get; set; }
        public List<string> WasteTypeNames { get; set; } = new();

        // Collector assignment info
        public int? AssignmentId { get; set; }
        public string? AssignmentStatus { get; set; }
        public int? CollectorId { get; set; }
        public string? CollectorName { get; set; }
        public int? CollectorWarningCount { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? ArrivedAt { get; set; }
        public string? BeforeImageUrl { get; set; }

        // Collection confirmation info
        public int? ConfirmationId { get; set; }
        public string? ConfirmationNote { get; set; }
        public DateTime? ConfirmedAt { get; set; }
        public string? ConfirmationBeforeImageUrl { get; set; }
        public string? ConfirmationAfterImageUrl { get; set; }

        // Enterprise info
        public int? EnterpriseId { get; set; }
        public string? EnterpriseName { get; set; }
    }

    /// <summary>
    /// Admin resolve action: "warn" (+1pt) or "reassign" (+2pt)
    /// </summary>
    public class ResolveFeedbackDto
    {
        /// <summary>
        /// "warn" or "reassign"
        /// </summary>
        public string Action { get; set; } = null!;

        /// <summary>
        /// Admin's resolution note (required)
        /// </summary>
        public string AdminNote { get; set; } = null!;
    }
}
