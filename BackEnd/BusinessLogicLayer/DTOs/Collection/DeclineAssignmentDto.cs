namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// DTO for collector to decline an assignment
    /// </summary>
    public class DeclineAssignmentDto
    {
        public string Reason { get; set; } = null!;  // Required: Lý do từ chối
    }
}
