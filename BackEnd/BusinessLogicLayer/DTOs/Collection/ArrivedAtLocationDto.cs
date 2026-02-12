using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// DTO for marking arrival at collection location (with before photo)
    /// </summary>
    public class ArrivedAtLocationDto
    {
        public IFormFile? BeforeImage { get; set; }  // Photo before collection (waste at site)
        public string? Note { get; set; }            // Optional note when arrived
    }
}
