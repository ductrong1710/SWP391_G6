using System;
using System.Collections.Generic;

namespace DataAccessLayer.Models;

public partial class User
{
    public int UserId { get; set; }

    public int RoleId { get; set; }

    public string FullName { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Status { get; set; }

    public DateTime? CreatedAt { get; set; }

    public virtual ICollection<Collectionrequest> Collectionrequests { get; set; } = new List<Collectionrequest>();

    public virtual ICollection<Collectorassignment> CollectorassignmentAssignedByNavigations { get; set; } = new List<Collectorassignment>();

    public virtual ICollection<Collectorassignment> CollectorassignmentAssignedCollectorNavigations { get; set; } = new List<Collectorassignment>();

    public virtual ICollection<Feedback> Feedbacks { get; set; } = new List<Feedback>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Rewardtransaction> Rewardtransactions { get; set; } = new List<Rewardtransaction>();

    public virtual Role Role { get; set; } = null!;

    public virtual ICollection<Wastereport> Wastereports { get; set; } = new List<Wastereport>();
}
