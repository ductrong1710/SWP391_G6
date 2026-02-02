using BusinessLogicLayer.DTOs.WasteReport;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class WasteReportService : IWasteReportService
    {
        private const int MaxReportsPerMinute = 2;
        private const int DuplicateRadiusMeters = 30; 
        private const int DuplicateTimeWindowMinutes = 30; 
        private readonly IUnitOfWork _uow;

        public WasteReportService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<WasteReportCreatedResponseDto> CreateAsync(int userId, CreateWasteReportDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Image))
            {
                throw new ArgumentException("Image is required");
            }

            if (dto.Latitude < -90 || dto.Latitude > 90)
            {
                throw new ArgumentException("Latitude must be between -90 and 90");
            }

            if (dto.Longitude < -180 || dto.Longitude > 180)
            {
                throw new ArgumentException("Longitude must be between -180 and 180");
            }

            var wasteType = await _uow.WasteTypes.GetByIdAsync(dto.WasteTypeId);
            if (wasteType == null)
            {
                throw new ArgumentException("WasteTypeId is invalid");
            }

            var sinceUtc = DateTime.UtcNow.AddMinutes(-1);
            var recentCount = await _uow.WasteReports.CountByUserSinceAsync(userId, sinceUtc);
            if (recentCount >= MaxReportsPerMinute)
            {
                throw new InvalidOperationException("Rate limit exceeded: max 2 waste reports per minute");
            }

            var nowUtc = DateTime.UtcNow;
            var duplicateCheckSince = nowUtc.AddMinutes(-DuplicateTimeWindowMinutes);
            
            var latDelta = 0.001m;
            var lonDelta = 0.001m;

            var nearbyReports = await _uow.WasteReports.FindNearbyReportsAsync(
                dto.WasteTypeId,
                dto.Latitude,
                dto.Longitude,
                latDelta,
                lonDelta,
                duplicateCheckSince
            );

            var isDuplicate = nearbyReports.Any(r => 
                CalculateDistanceMeters((double)r.Latitude, (double)r.Longitude, (double)dto.Latitude, (double)dto.Longitude) 
                <= DuplicateRadiusMeters
            );

            var status = isDuplicate ? "Duplicate" : "Pending";

            var entity = new Wastereport
            {
                SubmittedBy = userId,
                WasteTypeId = dto.WasteTypeId,
                ImageUrl = dto.Image,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Description = dto.Description,
                Status = status,
                CreatedAt = nowUtc
            };

            await _uow.WasteReports.AddAsync(entity);
            await _uow.SaveChangesAsync();

            return new WasteReportCreatedResponseDto
            {
                Id = entity.ReportId,
                Status = entity.Status,
                CreatedAt = entity.CreatedAt ?? nowUtc
            };
        }

        public async Task<WasteReportStatusResponseDto> AcceptAsync(int reportId)
        {
            var report = await _uow.WasteReports.GetByIdAsync(reportId);
            if (report == null)
            {
                throw new InvalidOperationException("WasteReport not found");
            }

            if (!string.Equals(report.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only Pending reports can be accepted");
            }

            report.Status = "Accepted";
            _uow.WasteReports.Update(report);
            await _uow.SaveChangesAsync();

            return new WasteReportStatusResponseDto
            {
                Id = report.ReportId,
                Status = report.Status
            };
        }

        public async Task<WasteReportStatusResponseDto> RejectAsync(int reportId)
        {
            var report = await _uow.WasteReports.GetByIdAsync(reportId);
            if (report == null)
            {
                throw new InvalidOperationException("WasteReport not found");
            }

            if (!string.Equals(report.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only Pending reports can be rejected");
            }

            report.Status = "Rejected";
            _uow.WasteReports.Update(report);
            await _uow.SaveChangesAsync();

            return new WasteReportStatusResponseDto
            {
                Id = report.ReportId,
                Status = report.Status
            };
        }

        public async Task<IEnumerable<WasteReportDto>> GetAllAsync(int? userId)
        {
            IEnumerable<Wastereport> reports;

            if (userId.HasValue)
            {
                reports = await _uow.WasteReports.GetByUserIdAsync(userId.Value);
            }
            else
            {
                reports = await _uow.WasteReports.GetAllAsync();
            }

            return reports.Select(MapToDto);
        }

        public async Task<WasteReportDto?> GetByIdAsync(int reportId, int? userId)
        {
            var report = await _uow.WasteReports.GetByIdAsync(reportId);
            if (report == null)
            {
                return null;
            }

            if (userId.HasValue && report.SubmittedBy != userId.Value)
            {
                return null;
            }

            return MapToDto(report);
        }

        public async Task<WasteReportDto> UpdateAsync(int reportId, int userId, UpdateWasteReportDto dto)
        {
            var report = await _uow.WasteReports.GetByIdAsync(reportId);
            if (report == null)
            {
                throw new InvalidOperationException("WasteReport not found");
            }

            if (report.SubmittedBy != userId)
            {
                throw new UnauthorizedAccessException("You can only update your own reports");
            }

            if (!string.Equals(report.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only Pending reports can be updated");
            }

            if (dto.Latitude < -90 || dto.Latitude > 90)
            {
                throw new ArgumentException("Latitude must be between -90 and 90");
            }

            if (dto.Longitude < -180 || dto.Longitude > 180)
            {
                throw new ArgumentException("Longitude must be between -180 and 180");
            }

            var wasteType = await _uow.WasteTypes.GetByIdAsync(dto.WasteTypeId);
            if (wasteType == null)
            {
                throw new ArgumentException("WasteTypeId is invalid");
            }

            if (!string.IsNullOrWhiteSpace(dto.Image))
            {
                report.ImageUrl = dto.Image;
            }
            report.Latitude = dto.Latitude;
            report.Longitude = dto.Longitude;
            report.Description = dto.Description;
            report.WasteTypeId = dto.WasteTypeId;

            _uow.WasteReports.Update(report);
            await _uow.SaveChangesAsync();

            return MapToDto(report);
        }

        public async Task<WasteReportStatusResponseDto> CancelAsync(int reportId, int userId)
        {
            var report = await _uow.WasteReports.GetByIdAsync(reportId);
            if (report == null)
            {
                throw new InvalidOperationException("WasteReport not found");
            }

            if (report.SubmittedBy != userId)
            {
                throw new UnauthorizedAccessException("You can only cancel your own reports");
            }

            if (!string.Equals(report.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only Pending reports can be cancelled");
            }

            report.Status = "Cancelled";
            _uow.WasteReports.Update(report);
            await _uow.SaveChangesAsync();

            return new WasteReportStatusResponseDto
            {
                Id = report.ReportId,
                Status = report.Status
            };
        }

        private static WasteReportDto MapToDto(Wastereport report)
        {
            return new WasteReportDto
            {
                ReportId = report.ReportId,
                SubmittedBy = report.SubmittedBy,
                SubmittedByName = report.SubmittedByNavigation?.FullName ?? string.Empty,
                WasteTypeId = report.WasteTypeId,
                WasteTypeName = report.WasteType?.Name ?? string.Empty,
                ImageUrl = report.ImageUrl,
                Latitude = report.Latitude,
                Longitude = report.Longitude,
                Description = report.Description,
                Status = report.Status,
                CreatedAt = report.CreatedAt
            };
        }

        
        private static double CalculateDistanceMeters(double lat1, double lon1, double lat2, double lon2)
        {
            const double EarthRadiusKm = 6371;

            var dLat = DegreesToRadians(lat2 - lat1);
            var dLon = DegreesToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(DegreesToRadians(lat1)) * Math.Cos(DegreesToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            var distanceKm = EarthRadiusKm * c;

            return distanceKm * 1000; 
        }

        private static double DegreesToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }
}

