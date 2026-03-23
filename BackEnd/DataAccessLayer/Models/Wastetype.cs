using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Wastetype
{
    public int WasteTypeId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public int RewardPoints { get; set; }

    public bool IsActive { get; set; }

    public virtual ICollection<CollectionDetail> CollectionDetails { get; set; } = new List<CollectionDetail>();

    public virtual ICollection<Wastereport> Reports { get; set; } = new List<Wastereport>();
}
