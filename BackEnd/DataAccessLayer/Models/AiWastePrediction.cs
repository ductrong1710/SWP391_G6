using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class AiWastePrediction
{
    public int PredictionId { get; set; }

    public int ReportId { get; set; }

    public string SuggestedType { get; set; } = null!;

    public decimal? Confidence { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual Wastereport Report { get; set; } = null!;
}
