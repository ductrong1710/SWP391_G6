namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// Response DTO after marking arrival at location
    /// </summary>
    public class ArrivedAtLocationResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }  // "Arrived"
        public DateTime? ArrivedAt { get; set; }
        public string? BeforeImageUrl { get; set; }  // URL of before photo
        public string? Note { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
    }
}
