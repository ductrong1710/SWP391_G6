using BusinessLogicLayer.DTOs.Dashboard;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IDashboardService
    {
        Task<AdminDashboardDto> GetAdminDashboardAsync(int year);
    }
}
