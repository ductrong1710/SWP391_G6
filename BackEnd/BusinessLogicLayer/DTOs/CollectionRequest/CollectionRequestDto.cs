namespace BusinessLogicLayer.DTOs.CollectionRequest
{
    /// <summary>
    /// DTO for listing collection requests
    /// </summary>
    public class CollectionRequestDto
    {
        public int RequestId { get; set; }
        public int ReportId { get; set; }
        public int EnterpriseId { get; set; }
        public string? EnterpriseName { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Waste report information
        public string? WasteTypeId { get; set; }
        public string? WasteTypeName { get; set; }
        public string? ReportImageUrl { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? ReportDescription { get; set; }
        public string? ReportStatus { get; set; }
        public DateTime? ReportCreatedAt { get; set; }

        // Current assignment info (if any)
        public int? CurrentAssignmentId { get; set; }
        public int? AssignedCollectorId { get; set; }
        public string? AssignedCollectorName { get; set; }
        public string? AssignmentStatus { get; set; }
        public DateTime? AssignedAt { get; set; }
    }
}
