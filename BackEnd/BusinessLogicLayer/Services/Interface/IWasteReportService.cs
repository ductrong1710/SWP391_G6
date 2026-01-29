using BusinessLogicLayer.DTOs.WasteReport;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IWasteReportService
    {
        Task<WasteReportCreatedResponseDto> CreateAsync(int userId, CreateWasteReportDto dto);
    }
}

