namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// Response DTO after completing collection
    /// </summary>
    public class CompleteCollectionResponseDto
    {
        public int AssignmentId { get; set; }
        public int RequestId { get; set; }
        public int ConfirmationId { get; set; }
        public string? Status { get; set; }  // "Completed"
        public DateTime? CompletedAt { get; set; }
        public string? ProofImageUrl { get; set; }
        public string? Note { get; set; }
    }
}
