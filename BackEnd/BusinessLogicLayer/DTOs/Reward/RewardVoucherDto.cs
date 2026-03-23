namespace BusinessLogicLayer.DTOs.Reward
{
    public class RewardVoucherDto
    {
        public int RewardId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int Points { get; set; }
        public bool Status { get; set; }
    }
}
