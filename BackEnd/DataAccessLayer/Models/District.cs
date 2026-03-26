namespace DataAccessLayer.Models;

public partial class District
{
    public int DistrictId { get; set; }
    public string Name { get; set; } = null!;
    public string? Code { get; set; }
    public bool IsActive { get; set; }

    public virtual ICollection<EnterpriseProfile> EnterpriseProfiles { get; set; } = new List<EnterpriseProfile>();
    public virtual ICollection<Wastereport> Wastereports { get; set; } = new List<Wastereport>();
}
