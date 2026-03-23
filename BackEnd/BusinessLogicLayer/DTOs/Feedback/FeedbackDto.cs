namespace BusinessLogicLayer.DTOs.Feedback
{
    public class CreateFeedbackDto
    {
        public int ReportId { get; set; }
        public string Content { get; set; } = null!;
    }

    public class FeedbackResponseDto
    {
        public int FeedbackId { get; set; }
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int? ReportId { get; set; }
        public string Content { get; set; } = string.Empty;
        public string? Status { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
