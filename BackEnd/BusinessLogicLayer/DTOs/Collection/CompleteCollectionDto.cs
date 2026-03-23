using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// DTO for completing collection (with after photo)
    /// Note: Before photo is uploaded during "Arrived" step
    /// </summary>
    public class CompleteCollectionDto
    {
        public class WasteWeightItemDto
        {
            public int WasteTypeId { get; set; }
            public double Weight { get; set; } 
        }
        public IFormFile? AfterImage { get; set; }   // Photo after collection (cleaned site)
        public string? Note { get; set; }            // Additional notes
        public List<WasteWeightItemDto> ActualWeights { get; set; } = new List<WasteWeightItemDto>();
    }
}
