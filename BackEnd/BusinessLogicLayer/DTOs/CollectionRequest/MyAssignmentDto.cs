namespace BusinessLogicLayer.DTOs.CollectionRequest
{
    /// <summary>
    /// DTO for collectors to view their assigned collections
    /// </summary>
    public class MyAssignmentDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }
        public DateTime? AssignedAt { get; set; }

        // Enterprise info
        public int EnterpriseId { get; set; }
        public string? EnterpriseName { get; set; }
        public string? EnterprisePhone { get; set; }

        // Waste report info
        public int ReportId { get; set; }
        public string? WasteTypeName { get; set; }
        public string? ImageUrl { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Description { get; set; }
        public string? ReportStatus { get; set; }
        public DateTime? ReportCreatedAt { get; set; }

        // Citizen info
        public string? CitizenName { get; set; }
        public string? CitizenPhone { get; set; }
    }
}
