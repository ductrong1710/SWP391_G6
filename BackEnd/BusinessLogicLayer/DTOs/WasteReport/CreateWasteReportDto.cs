namespace BusinessLogicLayer.DTOs.WasteReport
{
    public class CreateWasteReportRequestDto
    {
        public int WasteTypeId { get; set; }
        public string ImageUrl { get; set; } = null!;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string? Description { get; set; }
    }
}
