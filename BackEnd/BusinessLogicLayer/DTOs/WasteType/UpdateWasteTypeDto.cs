namespace BusinessLogicLayer.DTOs.WasteType
{
    public class UpdateWasteTypeDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int RewardPoints { get; set; }
        public bool? IsActive { get; set; }
    }
}

