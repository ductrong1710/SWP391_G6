namespace DataAccessLayer.Models;

public partial class CollectorProfile
{
    public int CollectorId { get; set; }
    public int EnterpriseId { get; set; }
    public bool IsAvailable { get; set; }
    public DateTime? AvailabilityUpdatedAt { get; set; }
    public int WarningCount { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual User Collector { get; set; } = null!;
    public virtual User Enterprise { get; set; } = null!;
    public virtual EnterpriseProfile? EnterpriseProfile { get; set; }
}
