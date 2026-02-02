namespace DataAccessLayer.Models;

public partial class Rewardtransaction
{
    public int TransactionId { get; set; }

    public int UserId { get; set; }

    public int RewardId { get; set; }

    public int ReportId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Wastereport Report { get; set; } = null!;

    public virtual Reward Reward { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
