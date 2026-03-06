namespace DataAccessLayer.Models;

public partial class Rewardtransaction
{
    public int TransactionId { get; set; }

    public int UserId { get; set; }

    public int RewardId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string Type { get; set; } = "redeem"; // "earn" hoặc "redeem"

    public int Points { get; set; } = 0;

    public string? Description { get; set; }


    public virtual Reward Reward { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
