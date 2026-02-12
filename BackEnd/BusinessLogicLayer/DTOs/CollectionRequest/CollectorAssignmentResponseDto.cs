namespace BusinessLogicLayer.DTOs.CollectionRequest
{
    public class CollectorAssignmentResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public int AssignedCollector { get; set; }
        public string? CollectorName { get; set; }
        public int AssignedBy { get; set; }
        public string? AssignedByName { get; set; }
        public string? Status { get; set; }
        public DateTime? AssignedAt { get; set; }
    }
}
