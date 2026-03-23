namespace BusinessLogicLayer.DTOs.Dashboard
{
    public class AdminDashboardDto
    {
        // Summary cards
        public int TotalUsers { get; set; }
        public int TotalCitizens { get; set; }
        public int TotalEnterprises { get; set; }
        public int TotalCollectors { get; set; }
        public int TotalReports { get; set; }
        public int PendingReports { get; set; }
        public int AcceptedReports { get; set; }
        public int CollectedReports { get; set; }
        public int CancelledReports { get; set; }
        public int RejectedReports { get; set; }
        public int TotalAssignments { get; set; }
        public int CompletedAssignments { get; set; }

        // Chart: Reports by month
        public List<MonthlyReportDto> ReportsByMonth { get; set; } = new();

        // Chart: Waste type distribution (PieChart)
        public List<WasteTypeDistributionDto> WasteTypeDistribution { get; set; } = new();

        // Chart: Report status distribution (PieChart)
        public List<StatusCountDto> ReportStatusDistribution { get; set; } = new();

        // Chart: User registrations by month
        public List<MonthlyCountDto> UserRegistrationsByMonth { get; set; } = new();

        // Top collectors
        public List<TopCollectorDto> TopCollectors { get; set; } = new();

        // Recent reports
        public List<RecentReportDto> RecentReports { get; set; } = new();
    }

    public class MonthlyReportDto
    {
        public int Month { get; set; }
        public string MonthName { get; set; } = null!;
        public int Count { get; set; }
    }

    public class WasteTypeDistributionDto
    {
        public string Name { get; set; } = null!;
        public int Count { get; set; }
    }

    public class StatusCountDto
    {
        public string Status { get; set; } = null!;
        public int Count { get; set; }
    }

    public class MonthlyCountDto
    {
        public int Month { get; set; }
        public string MonthName { get; set; } = null!;
        public int Count { get; set; }
    }

    public class TopCollectorDto
    {
        public int UserId { get; set; }
        public string FullName { get; set; } = null!;
        public int CompletedCount { get; set; }
    }

    public class RecentReportDto
    {
        public int ReportId { get; set; }
        public string SubmittedByName { get; set; } = null!;
        public string? Description { get; set; }
        public string? Status { get; set; }
        public List<string> WasteTypeNames { get; set; } = new();
        public DateTime? CreatedAt { get; set; }
    }
}
