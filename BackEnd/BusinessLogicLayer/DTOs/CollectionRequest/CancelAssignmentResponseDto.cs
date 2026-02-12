namespace BusinessLogicLayer.DTOs.CollectionRequest
{
    public class CancelAssignmentResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public string? Status { get; set; }
    }
}
