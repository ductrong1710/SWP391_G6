using BusinessLogicLayer.DTOs.Assignment;

namespace BusinessLogicLayer.DTOs.CollectionRequest
{
    /// <summary>
    /// DTO for detailed collection request view
    /// </summary>
    public class CollectionRequestDetailDto
    {
        public int RequestId { get; set; }
        public int ReportId { get; set; }
        public int EnterpriseId { get; set; }
        public string? EnterpriseName { get; set; }
        public string? EnterpriseEmail { get; set; }
        public string? EnterprisePhone { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }

        // Waste report details
        public WasteReportInfo? Report { get; set; }

        // Assignment history
        public List<AssignmentHistoryDto>? AssignmentHistory { get; set; }
    }

    public class WasteReportInfo
    {
        public int ReportId { get; set; }
        public int SubmittedBy { get; set; }
        public string? CitizenName { get; set; }
        public string? CitizenEmail { get; set; }
        public int WasteTypeId { get; set; }
        public string? WasteTypeName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Description { get; set; }
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
