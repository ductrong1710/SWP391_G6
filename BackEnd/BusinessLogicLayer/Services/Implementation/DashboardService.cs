using BusinessLogicLayer.DTOs.Dashboard;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Repositories.Interface;
using System.Globalization;

namespace BusinessLogicLayer.Services.Implementation
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<AdminDashboardDto> GetAdminDashboardAsync(int year)
        {
            var dto = new AdminDashboardDto();

            // ── 1. Users ──
            var allUsers = (await _unitOfWork.Users.GetAllAsync()).ToList();

            dto.TotalUsers = allUsers.Count;
            dto.TotalCitizens = allUsers.Count(u => u.Role?.RoleName == "Citizen");
            dto.TotalEnterprises = allUsers.Count(u => u.Role?.RoleName == "Enterprise");
            dto.TotalCollectors = allUsers.Count(u => u.Role?.RoleName == "Collector");

            // User registrations by month (for the requested year)
            var monthNames = CultureInfo.InvariantCulture.DateTimeFormat.AbbreviatedMonthNames;
            dto.UserRegistrationsByMonth = Enumerable.Range(1, 12).Select(m => new MonthlyCountDto
            {
                Month = m,
                MonthName = monthNames[m - 1],
                Count = allUsers.Count(u => u.CreatedAt.HasValue
                                            && u.CreatedAt.Value.Year == year
                                            && u.CreatedAt.Value.Month == m)
            }).ToList();

            // ── 2. Waste Reports ──
            var allReports = (await _unitOfWork.WasteReports.GetAllAsync()).ToList();

            dto.TotalReports = allReports.Count;
            dto.PendingReports = allReports.Count(r => r.Status == "Pending");
            dto.AcceptedReports = allReports.Count(r => r.Status == "Accepted");
            dto.CollectedReports = allReports.Count(r => r.Status == "Collected");
            dto.CancelledReports = allReports.Count(r => r.Status == "Cancelled");
            dto.RejectedReports = allReports.Count(r => r.Status == "Rejected");

            // Reports by month
            dto.ReportsByMonth = Enumerable.Range(1, 12).Select(m => new MonthlyReportDto
            {
                Month = m,
                MonthName = monthNames[m - 1],
                Count = allReports.Count(r => r.CreatedAt.HasValue
                                              && r.CreatedAt.Value.Year == year
                                              && r.CreatedAt.Value.Month == m)
            }).ToList();

            // Report status distribution
            dto.ReportStatusDistribution = allReports
                .GroupBy(r => r.Status ?? "Unknown")
                .Select(g => new StatusCountDto { Status = g.Key, Count = g.Count() })
                .OrderByDescending(s => s.Count)
                .ToList();

            // Waste type distribution
            var wasteTypeCounts = new Dictionary<string, int>();
            foreach (var report in allReports)
            {
                if (report.WasteTypes != null)
                {
                    foreach (var wt in report.WasteTypes)
                    {
                        var name = wt.Name ?? "Other";
                        wasteTypeCounts[name] = wasteTypeCounts.GetValueOrDefault(name) + 1;
                    }
                }
            }
            dto.WasteTypeDistribution = wasteTypeCounts
                .Select(kvp => new WasteTypeDistributionDto { Name = kvp.Key, Count = kvp.Value })
                .OrderByDescending(w => w.Count)
                .ToList();

            // ── 3. Assignments ──
            var collectors = allUsers.Where(u => u.Role?.RoleName == "Collector").ToList();
            var collectorCompletedCounts = new List<TopCollectorDto>();

            foreach (var collector in collectors)
            {
                var assignments = (await _unitOfWork.CollectorAssignments
                    .GetByCollectorIdAsync(collector.UserId)).ToList();

                var completedCount = assignments.Count(a => a.Status == "Completed");

                if (completedCount > 0)
                {
                    collectorCompletedCounts.Add(new TopCollectorDto
                    {
                        UserId = collector.UserId,
                        FullName = collector.FullName,
                        CompletedCount = completedCount
                    });
                }
            }

            dto.TopCollectors = collectorCompletedCounts
                .OrderByDescending(c => c.CompletedCount)
                .Take(5)
                .ToList();

            // Total assignments
            int totalAssignments = 0;
            int completedAssignments = 0;
            foreach (var collector in collectors)
            {
                var assignments = await _unitOfWork.CollectorAssignments
                    .GetByCollectorIdAsync(collector.UserId);
                var assignmentList = assignments.ToList();
                totalAssignments += assignmentList.Count;
                completedAssignments += assignmentList.Count(a => a.Status == "Completed");
            }
            dto.TotalAssignments = totalAssignments;
            dto.CompletedAssignments = completedAssignments;

            // ── 4. Recent Reports ──
            dto.RecentReports = allReports
                .OrderByDescending(r => r.CreatedAt)
                .Take(5)
                .Select(r => new RecentReportDto
                {
                    ReportId = r.ReportId,
                    SubmittedByName = r.SubmittedByNavigation?.FullName ?? "Unknown",
                    Description = r.Description,
                    Status = r.Status,
                    WasteTypeNames = r.WasteTypes?.Select(w => w.Name).ToList() ?? new List<string>(),
                    CreatedAt = r.CreatedAt
                })
                .ToList();

            return dto;
        }
    }
}
