using BusinessLogicLayer.DTOs.WasteReport;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class WasteReportService : IWasteReportService
    {
        private readonly IUnitOfWork _unitOfWork;

        public WasteReportService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<int> CreateReportAsync(int userId, CreateWasteReportDto dto)
        {
            var report = new Wastereport
            {
                SubmittedBy = userId,
                WasteTypeId = dto.WasteTypeId,
                ImageUrl = dto.ImageUrl,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Description = dto.Description,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.WasteReports.AddAsync(report);
            await _unitOfWork.SaveChangesAsync();

            return report.ReportId;
        }

        public async Task<IEnumerable<Wastereport>> GetPendingReportsAsync()
        {
            return await _unitOfWork.WasteReports.GetPendingReportsAsync();
        }
    }

}
