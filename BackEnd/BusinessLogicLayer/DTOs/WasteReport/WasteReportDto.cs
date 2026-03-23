namespace BusinessLogicLayer.DTOs.WasteReport
{
    public class WasteReportDto
    {
        public int ReportId { get; set; }
        public int SubmittedBy { get; set; }
        public string SubmittedByName { get; set; } = string.Empty;
        public List<int> WasteTypeIds { get; set; } = new List<int>();
        public List<string> WasteTypeNames { get; set; } = new List<string>();
        public string ImageUrl { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string? Description { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
    }
}
