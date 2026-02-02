namespace DataAccessLayer.Models;

public partial class Wastetype
{
    public int WasteTypeId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public virtual ICollection<Wastereport> Wastereports { get; set; } = new List<Wastereport>();
}
