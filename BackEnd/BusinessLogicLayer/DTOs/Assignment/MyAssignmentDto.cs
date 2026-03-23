namespace BusinessLogicLayer.DTOs.Assignment
{
    public class MyAssignmentDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string Status { get; set; } = string.Empty;

        public DateTime? AssignedAt { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? ArrivedAt { get; set; }
        public DateTime? CompletedAt { get; set; }

        public string? BeforeImageUrl { get; set; }
        public string? AfterImageUrl { get; set; }
        public string? CompletionNote { get; set; }

        public int EnterpriseId { get; set; }
        public string? EnterpriseName { get; set; }
        public string? EnterprisePhone { get; set; }

        public int ReportId { get; set; }
        public string? ReportImageUrl { get; set; }

        public List<int> WasteTypeIds { get; set; } = new();
        public string? WasteTypeName { get; set; }
        public List<EstimatedWasteItemDto> WasteItems { get; set; } = new();

        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string? Description { get; set; }

        public string? ReportStatus { get; set; }
        public DateTime? ReportCreatedAt { get; set; }

        public string? CitizenName { get; set; }
        public string? CitizenPhone { get; set; }

        public string? Note { get; set; }
        public string? IssueReport { get; set; }
        public string? IssueReason { get; set; }
        public string? IssueImageUrl { get; set; }

        public decimal TotalCollectedWeight { get; set; }
        public string? CollectedWasteSummary { get; set; }
    }
}
