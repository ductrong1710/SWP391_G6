using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// DTO for completing collection (with proof image)
    /// </summary>
    public class CompleteCollectionDto
    {
        public IFormFile? ProofImage { get; set; }  // Ảnh chứng minh
        public string? Note { get; set; }           // Ghi chú
    }
}
