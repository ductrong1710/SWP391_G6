using BusinessLogicLayer.DTOs.WasteReport;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IWasteReportService
    {
        Task<WasteReportCreatedResponseDto> CreateAsync(int userId, CreateWasteReportDto dto);
        Task<WasteReportStatusResponseDto> AcceptAsync(int reportId);
        Task<WasteReportStatusResponseDto> RejectAsync(int reportId);
        Task<IEnumerable<WasteReportDto>> GetAllAsync(int? userId);
        Task<WasteReportDto?> GetByIdAsync(int reportId, int? userId);
        Task<WasteReportDto> UpdateAsync(int reportId, int userId, UpdateWasteReportDto dto);
        Task<WasteReportStatusResponseDto> CancelAsync(int reportId, int userId);
    }
}

