namespace DataAccessLayer.Models;

public partial class Collectorassignment
{
    public int AssignmentId { get; set; }

    public int RequestId { get; set; }

    public int AssignedCollector { get; set; }

    public int AssignedBy { get; set; }

    public string? Status { get; set; }

    public DateTime? AssignedAt { get; set; }

    public DateTime? StartedAt { get; set; }  // When collector starts collection (Status: OnTheWay)

    public DateTime? ArrivedAt { get; set; }  // When collector arrived at location (Status: Arrived)

    public string? BeforeImageUrl { get; set; }  // Photo before collection (uploaded when arrived)
    // Note: CompletedAt is tracked in Collectionconfirmation.ConfirmedAt

    public virtual User AssignedByNavigation { get; set; } = null!;

    public virtual User AssignedCollectorNavigation { get; set; } = null!;

    public virtual Collectionconfirmation? Collectionconfirmation { get; set; }

    public virtual Collectionrequest Request { get; set; } = null!;
}
