namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// Response DTO after reporting an issue
    /// </summary>
    public class ReportIssueResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }  // "Issue"
        public string? IssueType { get; set; }
        public string? Description { get; set; }
        public string? ProofImageUrl { get; set; }
        public DateTime? ReportedAt { get; set; }
    }
}
