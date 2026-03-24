using BusinessLogicLayer.DTOs.Dashboard;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using System.Globalization;

namespace BusinessLogicLayer.Services.Implementation
{
    public class DashboardService : IDashboardService
    {
        private readonly AppDbContext _db;
        private readonly IMemoryCache _cache;

        public DashboardService(AppDbContext db, IMemoryCache cache)
        {
            _db = db;
            _cache = cache;
        }

        public async Task<AdminDashboardDto> GetAdminDashboardAsync(int year)
        {
            var cacheKey = $"admin_dashboard_{year}";
            if (_cache.TryGetValue(cacheKey, out AdminDashboardDto? cached) && cached != null)
                return cached;

            var dto = new AdminDashboardDto();
            var monthNames = CultureInfo.InvariantCulture.DateTimeFormat.AbbreviatedMonthNames;

            // ── All lightweight queries sequentially (EF Core DbContext is not thread-safe) ──

            // 1. User counts by role
            var userCounts = await _db.Users
                .GroupBy(u => u.Role!.RoleName)
                .Select(g => new { Role = g.Key, Count = g.Count() })
                .ToListAsync();

            // 2. User registrations by month
            var userRegData = await _db.Users
                .Where(u => u.CreatedAt.HasValue && u.CreatedAt.Value.Year == year)
                .GroupBy(u => u.CreatedAt!.Value.Month)
                .Select(g => new { Month = g.Key, Count = g.Count() })
                .ToListAsync();

            // 3. Report counts by status
            var reportStatus = await _db.Wastereports
                .GroupBy(r => r.Status ?? "Unknown")
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            // 4. Reports by month
            var reportMonthData = await _db.Wastereports
                .Where(r => r.CreatedAt.HasValue && r.CreatedAt.Value.Year == year)
                .GroupBy(r => r.CreatedAt!.Value.Month)
                .Select(g => new { Month = g.Key, Count = g.Count() })
                .ToListAsync();

            // 5. Waste type distribution
            var wasteTypeData = await _db.Wastetypes
                .Select(wt => new { wt.Name, Count = wt.Reports.Count() })
                .Where(x => x.Count > 0)
                .ToListAsync();

            // 6. Assignment counts
            var assignCounts = await _db.Collectorassignments
                .GroupBy(a => a.Status)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            // 7. Top collectors
            var topCollectors = await _db.Collectorassignments
                .Where(a => a.Status == "Completed")
                .GroupBy(a => new { a.AssignedCollector, a.AssignedCollectorNavigation.FullName })
                .Select(g => new TopCollectorDto
                {
                    UserId = g.Key.AssignedCollector,
                    FullName = g.Key.FullName ?? "Unknown",
                    CompletedCount = g.Count()
                })
                .OrderByDescending(c => c.CompletedCount)
                .Take(5)
                .ToListAsync();

            // 8. Recent reports (only 5, minimal projection)
            var recentReports = await _db.Wastereports
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new RecentReportDto
                {
                    ReportId = r.ReportId,
                    SubmittedByName = r.SubmittedByNavigation != null ? r.SubmittedByNavigation.FullName : "Unknown",
                    Description = r.Description,
                    Status = r.Status,
                    WasteTypeNames = r.WasteTypes.Select(w => w.Name).ToList(),
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();


            // ── Map results ──
            dto.TotalUsers = userCounts.Sum(x => x.Count);
            dto.TotalCitizens = userCounts.FirstOrDefault(x => x.Role == "Citizen")?.Count ?? 0;
            dto.TotalEnterprises = userCounts.FirstOrDefault(x => x.Role == "Enterprise")?.Count ?? 0;
            dto.TotalCollectors = userCounts.FirstOrDefault(x => x.Role == "Collector")?.Count ?? 0;

            dto.UserRegistrationsByMonth = Enumerable.Range(1, 12).Select(m => new MonthlyCountDto
            {
                Month = m,
                MonthName = monthNames[m - 1],
                Count = userRegData.FirstOrDefault(x => x.Month == m)?.Count ?? 0
            }).ToList();

            dto.TotalReports = reportStatus.Sum(x => x.Count);
            dto.PendingReports = reportStatus.FirstOrDefault(x => x.Status == "Pending")?.Count ?? 0;
            dto.AcceptedReports = reportStatus.FirstOrDefault(x => x.Status == "Accepted")?.Count ?? 0;
            dto.CollectedReports = reportStatus.FirstOrDefault(x => x.Status == "Collected")?.Count ?? 0;
            dto.CancelledReports = reportStatus.FirstOrDefault(x => x.Status == "Cancelled")?.Count ?? 0;
            dto.RejectedReports = reportStatus.FirstOrDefault(x => x.Status == "Rejected")?.Count ?? 0;

            dto.ReportStatusDistribution = reportStatus
                .Select(x => new StatusCountDto { Status = x.Status, Count = x.Count })
                .OrderByDescending(x => x.Count)
                .ToList();

            dto.ReportsByMonth = Enumerable.Range(1, 12).Select(m => new MonthlyReportDto
            {
                Month = m,
                MonthName = monthNames[m - 1],
                Count = reportMonthData.FirstOrDefault(x => x.Month == m)?.Count ?? 0
            }).ToList();

            dto.WasteTypeDistribution = wasteTypeData
                .Select(x => new WasteTypeDistributionDto { Name = x.Name ?? "Other", Count = x.Count })
                .OrderByDescending(x => x.Count)
                .ToList();

            dto.TotalAssignments = assignCounts.Sum(x => x.Count);
            dto.CompletedAssignments = assignCounts.FirstOrDefault(x => x.Status == "Completed")?.Count ?? 0;

            dto.TopCollectors = topCollectors;
            dto.RecentReports = recentReports;

            _cache.Set(cacheKey, dto, TimeSpan.FromSeconds(30));
            return dto;
        }
    }
}
