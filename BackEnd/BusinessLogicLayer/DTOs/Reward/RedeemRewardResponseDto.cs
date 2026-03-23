namespace BusinessLogicLayer.DTOs.Reward
{
    public class RedeemRewardResponseDto
    {
        public int TransactionId { get; set; }
        public int RewardId { get; set; }
        public string RewardName { get; set; } = string.Empty;
        public int RedeemedPoints { get; set; }
        public int RemainingPoints { get; set; }
        public DateTime RedeemedAt { get; set; }
    }
}
