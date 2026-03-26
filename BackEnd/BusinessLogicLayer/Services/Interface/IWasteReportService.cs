using BusinessLogicLayer.DTOs.WasteReport;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IWasteReportService
    {
        Task<WasteReportCreatedResponseDto> CreateAsync(int userId, CreateWasteReportDto dto);
        Task<WasteReportStatusResponseDto> AcceptAsync(int reportId, int enterpriseId);
        Task<WasteReportStatusResponseDto> RejectAsync(int reportId);
        Task<IEnumerable<WasteReportDto>> GetAllAsync(int? userId, int? districtId = null);
        Task<WasteReportDto?> GetByIdAsync(int reportId, int? userId);
        Task<WasteReportDto> UpdateAsync(int reportId, int userId, UpdateWasteReportDto dto);
        Task<WasteReportStatusResponseDto> CancelAsync(int reportId, int userId);
        Task<WasteReportStatusResponseDto> CancelByEnterpriseAsync(int reportId, int enterpriseId);

    }
}

