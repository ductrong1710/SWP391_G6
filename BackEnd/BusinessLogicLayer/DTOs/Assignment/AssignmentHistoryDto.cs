namespace BusinessLogicLayer.DTOs.Assignment
{
    /// <summary>
    /// DTO for assignment history timeline
    /// </summary>
    public class AssignmentHistoryDto
    {
        public int AssignmentId { get; set; }
        public int AssignedCollector { get; set; }
        public string? CollectorName { get; set; }
        public string? CollectorPhone { get; set; }
        public int AssignedBy { get; set; }
        public string? AssignedByName { get; set; }
        public string? Status { get; set; }
        public DateTime? AssignedAt { get; set; }
    }
}
