namespace BusinessLogicLayer.DTOs.Reward
{
    public class RewardTransactionDto
    {
        public int TransactionId { get; set; }
        public int UserId { get; set; }
        public int? ReportId { get; set; }
        public int Points { get; set; }
        public string Type { get; set; } = null!; // "Earned", "Redeemed"
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}