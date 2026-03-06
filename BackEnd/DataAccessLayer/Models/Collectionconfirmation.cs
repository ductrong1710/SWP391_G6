using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Collectionconfirmation
{
    public int ConfirmationId { get; set; }

    public int AssignmentId { get; set; }

    /// <summary>
    /// Additional notes from collector
    /// </summary>
    public string? Note { get; set; }

    /// <summary>
    /// When collector completed the collection (Status: Completed)
    /// </summary>
    public DateTime? ConfirmedAt { get; set; }

    /// <summary>
    /// Photo before collection (waste at site) - from assignment.before_image_url
    /// </summary>
    public string BeforeImageUrl { get; set; } = null!;

    /// <summary>
    /// Photo after collection (cleaned site)
    /// </summary>
    public string AfterImageUrl { get; set; } = null!;

    public virtual Collectorassignment Assignment { get; set; } = null!;
}
