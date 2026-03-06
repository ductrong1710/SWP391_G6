using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Collectionrequest
{
    public int RequestId { get; set; }

    public int ReportId { get; set; }

    public int EnterpriseId { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Collectorassignment> Collectorassignments { get; set; } = new List<Collectorassignment>();

    public virtual User Enterprise { get; set; } = null!;

    public virtual Wastereport Report { get; set; } = null!;
}
