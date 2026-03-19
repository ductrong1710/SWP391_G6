namespace BusinessLogicLayer.DTOs.Assignment
{
    public class MyAssignmentDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }
        public DateTime? AssignedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? ArrivedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? BeforeImageUrl { get; set; }

        public int EnterpriseId { get; set; }
        public string? EnterpriseName { get; set; }
        public string? EnterprisePhone { get; set; }

        public int ReportId { get; set; }
        public List<int> WasteTypeIds { get; set; } = new();

        public string? WasteTypeName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Description { get; set; }
        public string? ReportStatus { get; set; }
        public DateTime? ReportCreatedAt { get; set; }

        public string? CitizenName { get; set; }
        public string? CitizenPhone { get; set; }

        public double TotalCollectedWeight { get; set; }
        public string? CollectedWasteSummary { get; set; }
    }
}
