using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class Feedback
{
    public int FeedbackId { get; set; }

    public int UserId { get; set; }

    public int? ReportId { get; set; }

    public string Content { get; set; } = null!;

    public string? Status { get; set; }

    public string? ImageUrl { get; set; }

    public DateTime? CreatedAt { get; set; }

    public string? ResolutionNote { get; set; }

    public virtual Wastereport? Report { get; set; }

    public virtual User User { get; set; } = null!;
}
