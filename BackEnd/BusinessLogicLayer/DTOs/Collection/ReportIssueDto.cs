using Microsoft.AspNetCore.Http;

namespace BusinessLogicLayer.DTOs.Collection
{
    /// <summary>
    /// DTO for collector to report an issue during collection
    /// </summary>
    public class ReportIssueDto
    {
        public string IssueType { get; set; } = null!;  // Required: WasteNotFound, WrongAddress, WasteTypeMismatch, CitizenUnavailable, Other
        public string Description { get; set; } = null!;  // Required: Chi tiết vấn đề
        public IFormFile? ProofImage { get; set; }  // Optional: Ảnh chứng minh vấn đề
    }

    /// <summary>
    /// Issue types that collector can report
    /// </summary>
    public static class CollectionIssueTypes
    {
        public const string WasteNotFound = "WasteNotFound";  // Không tìm thấy rác
        public const string WrongAddress = "WrongAddress";  // Địa chỉ sai
        public const string WasteTypeMismatch = "WasteTypeMismatch";  // Loại rác không đúng
        public const string CitizenUnavailable = "CitizenUnavailable";  // Citizen không có nhà
        public const string Other = "Other";  // Vấn đề khác
    }
}
