namespace BusinessLogicLayer.DTOs.Assignment
{
    /// <summary>
    /// Response DTO after cancelling an assignment
    /// </summary>
    public class CancelAssignmentResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }
    }
}
