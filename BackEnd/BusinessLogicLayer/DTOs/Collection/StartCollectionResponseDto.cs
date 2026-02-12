namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// Response DTO when collector starts collection
    /// </summary>
    public class StartCollectionResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }  // "OnTheWay"
        public DateTime? StartedAt { get; set; }
        
        // Waste report info for navigation
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Address { get; set; }
    }
}
