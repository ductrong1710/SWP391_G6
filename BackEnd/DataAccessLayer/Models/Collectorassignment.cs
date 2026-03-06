using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Collectorassignment
{
    public int AssignmentId { get; set; }

    public int RequestId { get; set; }

    public int AssignedCollector { get; set; }

    public int AssignedBy { get; set; }

    public string? Status { get; set; }

    /// <summary>
    /// When enterprise assigned the collector
    /// </summary>
    public DateTime? AssignedAt { get; set; }

    /// <summary>
    /// When collector starts heading to location (Status: OnTheWay)
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// When collector arrived at location (Status: Arrived)
    /// </summary>
    public DateTime? ArrivedAt { get; set; }

    /// <summary>
    /// Photo before collection, uploaded when arrived
    /// </summary>
    public string? BeforeImageUrl { get; set; }

    public virtual User AssignedByNavigation { get; set; } = null!;

    public virtual User AssignedCollectorNavigation { get; set; } = null!;

    public virtual Collectionconfirmation? Collectionconfirmation { get; set; }

    public virtual Collectionrequest Request { get; set; } = null!;
}
