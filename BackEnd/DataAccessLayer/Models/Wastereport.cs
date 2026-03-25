using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Wastereport
{
    public int ReportId { get; set; }

    public int SubmittedBy { get; set; }

    public string ImageUrl { get; set; } = null!;

    public decimal Latitude { get; set; }

    public decimal Longitude { get; set; }

    public string? Description { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }
    public int? DistrictId { get; set; }
    public virtual District? District { get; set; }

    public virtual ICollection<AiWastePrediction> AiWastePredictions { get; set; } = new List<AiWastePrediction>();

    public virtual Collectionrequest? Collectionrequest { get; set; }

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual User SubmittedByNavigation { get; set; } = null!;

    public virtual ICollection<Wastetype> WasteTypes { get; set; } = new List<Wastetype>();
}
