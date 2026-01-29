namespace BusinessLogicLayer.DTOs.WasteReport
{
    public class WasteReportCreatedResponseDto
    {
        public int Id { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}

