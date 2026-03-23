namespace BusinessLogicLayer.DTOs.WasteType
{
    public class CreateWasteTypeDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int RewardPoints { get; set; }
    }
}

