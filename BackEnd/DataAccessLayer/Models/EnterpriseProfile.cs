namespace DataAccessLayer.Models;

public partial class EnterpriseProfile
{
    public int EnterpriseId { get; set; }
    public int ManagedDistrictId { get; set; }
    public DateTime? CreatedAt { get; set; }

    public virtual User Enterprise { get; set; } = null!;
    public virtual District ManagedDistrict { get; set; } = null!;
    public virtual ICollection<CollectorProfile> CollectorProfiles { get; set; } = new List<CollectorProfile>();
}
