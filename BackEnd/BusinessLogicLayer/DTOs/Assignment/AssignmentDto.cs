namespace BusinessLogicLayer.DTOs.Assignment
{
    /// <summary>
    /// DTO for viewing assignment details (Enterprise perspective)
    /// </summary>
    public class AssignmentDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public int AssignedCollector { get; set; }
        public string? CollectorName { get; set; }
        public string? CollectorEmail { get; set; }
        public string? CollectorPhone { get; set; }
        public int AssignedBy { get; set; }
        public string? AssignedByName { get; set; }
        public string? Status { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? ArrivedAt { get; set; }  // When arrived at location
        public DateTime? CompletedAt { get; set; }  // From Collectionconfirmation.ConfirmedAt
        public string? BeforeImageUrl { get; set; }  // Before photo (uploaded when arrived)

        // Collection request info
        public string? RequestStatus { get; set; }
        public DateTime? RequestCreatedAt { get; set; }

        // Waste report info
        public int ReportId { get; set; }
        public string? WasteTypeName { get; set; }
        public string? ReportImageUrl { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? ReportDescription { get; set; }
        public string? ReportStatus { get; set; }

        // Citizen info
        public int CitizenId { get; set; }
        public string? CitizenName { get; set; }
    }
}
