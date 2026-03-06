namespace DataAccessLayer.Models;

public partial class Reward
{
    public int RewardId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public int Points { get; set; }

    public bool Status { get; set; } = true;

    public virtual ICollection<Rewardtransaction> Rewardtransactions { get; set; } = new List<Rewardtransaction>();
}
