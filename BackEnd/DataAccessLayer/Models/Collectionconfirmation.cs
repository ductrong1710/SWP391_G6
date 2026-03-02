namespace DataAccessLayer.Models;

public partial class Collectionconfirmation
{
    public int ConfirmationId { get; set; }

    public int AssignmentId { get; set; }

    public string BeforeImageUrl { get; set; } = null!;  // Photo before collection (waste at site)

    public string AfterImageUrl { get; set; } = null!;   // Photo after collection (cleaned site)

    public string? Note { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    public virtual Collectorassignment Assignment { get; set; } = null!;
}
