namespace BusinessLogicLayer.DTOs.WasteReport
{
    public class UpdateWasteReportDto
    {
        public string? Image { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string? Description { get; set; }
        public List<int> WasteTypeIds { get; set; } = new List<int>();
    }
}
