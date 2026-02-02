namespace DataAccessLayer.Models;

public partial class Collectorassignment
{
    public int AssignmentId { get; set; }

    public int RequestId { get; set; }

    public int AssignedCollector { get; set; }

    public int AssignedBy { get; set; }

    public string? Status { get; set; }

    public DateTime? AssignedAt { get; set; }

    public virtual User AssignedByNavigation { get; set; } = null!;

    public virtual User AssignedCollectorNavigation { get; set; } = null!;

    public virtual Collectionconfirmation? Collectionconfirmation { get; set; }

    public virtual Collectionrequest Request { get; set; } = null!;
}
