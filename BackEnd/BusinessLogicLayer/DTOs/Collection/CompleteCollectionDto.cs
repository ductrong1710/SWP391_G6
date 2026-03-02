using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// DTO for completing collection (with after photo)
    /// Note: Before photo is uploaded during "Arrived" step
    /// </summary>
    public class CompleteCollectionDto
    {
        public IFormFile? AfterImage { get; set; }   // Photo after collection (cleaned site)
        public string? Note { get; set; }            // Additional notes
    }
}
