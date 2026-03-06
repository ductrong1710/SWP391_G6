using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Rewardtransaction
{
    public int TransactionId { get; set; }

    public int UserId { get; set; }

    public int RewardId { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string Type { get; set; } = null!;

    public int Points { get; set; }

    public string? Description { get; set; }

    public virtual Reward Reward { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
