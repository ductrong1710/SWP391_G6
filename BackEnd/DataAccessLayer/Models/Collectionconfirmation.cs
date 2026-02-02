namespace DataAccessLayer.Models;

public partial class Collectionconfirmation
{
    public int ConfirmationId { get; set; }

    public int AssignmentId { get; set; }

    public string ImageUrl { get; set; } = null!;

    public string? Note { get; set; }

    public DateTime? ConfirmedAt { get; set; }

    public virtual Collectorassignment Assignment { get; set; } = null!;
}
