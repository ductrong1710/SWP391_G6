using BusinessLogicLayer.DTOs.WasteReport;
using DataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BusinessLogicLayer.Services.Interface
{
    public interface IWasteReportService
    {
        Task<int> CreateReportAsync(int userId, CreateWasteReportDto dto);
        Task<IEnumerable<Wastereport>> GetPendingReportsAsync();
    }
}
