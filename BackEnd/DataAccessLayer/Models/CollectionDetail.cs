using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class CollectionDetail
{
    public int DetailId { get; set; }

    public int ConfirmationId { get; set; }

    public int WasteTypeId { get; set; }

    public double ActualWeight { get; set; }

    public virtual Collectionconfirmation Confirmation { get; set; } = null!;

    public virtual Wastetype WasteType { get; set; } = null!;
}
