namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// Response DTO after declining an assignment
    /// </summary>
    public class DeclineAssignmentResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }  // "Declined"
        public string? Reason { get; set; }
        public DateTime? DeclinedAt { get; set; }
    }
}
