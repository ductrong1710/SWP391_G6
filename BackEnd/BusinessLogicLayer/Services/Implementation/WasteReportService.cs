using BusinessLogicLayer.DTOs.WasteReport;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using DataAccessLayer.Data;
using Microsoft.EntityFrameworkCore;


namespace BusinessLogicLayer.Services.Implementation
{
    public class WasteReportService : IWasteReportService
    {
        private const int DuplicateRadiusMeters = 30;
        private readonly IUnitOfWork _uow;
        private readonly AppDbContext _db;

        public WasteReportService(IUnitOfWork uow, AppDbContext db)
        {
            _uow = uow;
            _db = db;
        }

        private async Task<int?> ResolveDistrictIdAsync(decimal latitude, decimal longitude)
        {
            var conn = _db.Database.GetDbConnection();

            if (conn.State != System.Data.ConnectionState.Open)
            {
                await conn.OpenAsync();
            }

            await using var cmd = conn.CreateCommand();
            cmd.CommandText = @"
                select district_id
                from districts
                where is_active = true
                  and st_contains(
                boundary,
                st_setsrid(st_point(@lng, @lat), 4326)
                     )
                 limit 1;";
            var latParam = cmd.CreateParameter();
            latParam.ParameterName = "@lat";
            latParam.Value = latitude;
            cmd.Parameters.Add(latParam);

            var lngParam = cmd.CreateParameter();
            lngParam.ParameterName = "@lng";
            lngParam.Value = longitude;
            cmd.Parameters.Add(lngParam);

            var result = await cmd.ExecuteScalarAsync();

            if (result == null || result == DBNull.Value)
            {
                return null;
            }

            return Convert.ToInt32(result);
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

            if (dto.WasteTypeIds == null || !dto.WasteTypeIds.Any())
            {
                throw new ArgumentException("At least one WasteTypeId is required");
            }

            var wasteTypes = new List<Wastetype>();
            foreach (var id in dto.WasteTypeIds)
            {
                var wt = await _uow.WasteTypes.GetByIdAsync(id);
                if (wt == null || wt.IsActive == false)
                {
                    throw new ArgumentException($"WasteTypeId {id} is invalid");
                }
                wasteTypes.Add(wt);
            }

            var nowUtc = DateTime.UtcNow;
            var latDelta = 0.001m;
            var lonDelta = 0.001m;

            var nearbyReports = await _uow.WasteReports.FindPotentialDuplicatesAsync(
                dto.WasteTypeIds,
                dto.Latitude,
                dto.Longitude,
                latDelta,
                lonDelta
            );

            var isDuplicate = nearbyReports.Any(r =>
                CalculateDistanceMeters((double)r.Latitude, (double)r.Longitude, (double)dto.Latitude, (double)dto.Longitude)
                <= DuplicateRadiusMeters
            );

            if (isDuplicate)
            {
                throw new InvalidOperationException("A similar waste report already exists in this location.");
            }
            var districtId = await ResolveDistrictIdAsync(dto.Latitude, dto.Longitude);
            if (!districtId.HasValue)
            {
                throw new InvalidOperationException("This location is outside supported service districts.");
            }

            var entity = new Wastereport
            {
                SubmittedBy = userId,
                ImageUrl = dto.Image,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                DistrictId = districtId.Value,
                Description = dto.Description,
                Status = "Pending",
                CreatedAt = nowUtc,
                WasteTypes = wasteTypes
            };

            await _uow.WasteReports.AddAsync(entity);
            var notif = new Notification
            {
                UserId = userId,
                Content = "Your waste report has been submitted successfully and is pending approval.",
                IsRead = false,
                CreatedAt = nowUtc
            };
            await _uow.Notifications.AddAsync(notif);

            var enterprises = await _uow.Users.GetUsersByRoleAsync("Enterprise");
            var targetEnterprise = enterprises.FirstOrDefault(e =>
                e.EnterpriseProfile != null &&
                e.EnterpriseProfile.ManagedDistrictId == districtId.Value
            );

            if (targetEnterprise != null)
            {
                var enterpriseNotif = new Notification
                {
                    UserId = targetEnterprise.UserId,
                    Content = $"A new waste report (Pending) has been submitted in your managed district.",
                    IsRead = false,
                    CreatedAt = nowUtc
                };
                await _uow.Notifications.AddAsync(enterpriseNotif);
            }

        await _uow.SaveChangesAsync();

            return new WasteReportCreatedResponseDto
            {
                Id = entity.ReportId,
                Status = entity.Status,
                CreatedAt = entity.CreatedAt ?? nowUtc
            };
        }

        public async Task<WasteReportStatusResponseDto> AcceptAsync(int reportId, int enterpriseId)
        {
            var report = await _uow.WasteReports.GetByIdAsync(reportId);
            if (report == null)
            {
                throw new InvalidOperationException("WasteReport not found");
            }

            var enterprise = await _uow.Users.GetByIdAsync(enterpriseId);
            if (enterprise == null || enterprise.EnterpriseProfile == null)
            {
                throw new InvalidOperationException("Enterprise profile not found");
            }

            if (!report.DistrictId.HasValue)
            {
                throw new InvalidOperationException("Report district is missing");
            }

            if (enterprise.EnterpriseProfile.ManagedDistrictId != report.DistrictId.Value)
            {
                throw new UnauthorizedAccessException("You can only accept reports in your managed district.");
            }

            if (!string.Equals(report.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Only Pending reports can be accepted");
            }

            var existingRequest = await _uow.CollectionRequests.GetByReportIdAsync(reportId);
            if (existingRequest != null)
            {
                throw new InvalidOperationException("Collection request already exists for this report");
            }
            report.Status = "Accepted";
            _uow.WasteReports.Update(report);

            var collectionRequest = new Collectionrequest
            {
                ReportId = reportId,
                EnterpriseId = enterpriseId,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            await _uow.CollectionRequests.AddAsync(collectionRequest);

            var notif = new Notification
            {
                UserId = report.SubmittedBy,
                Content = $"Your waste report #{reportId} has been accepted and is waiting for collection.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _uow.Notifications.AddAsync(notif);
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

            var notif = new Notification
            {
                UserId = report.SubmittedBy,
                Content = $"Your waste report #{reportId} has been rejected.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };
            await _uow.Notifications.AddAsync(notif);

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

            if (dto.WasteTypeIds == null || !dto.WasteTypeIds.Any())
            {
                throw new ArgumentException("At least one WasteTypeId is required");
            }

            var newWasteTypes = new List<Wastetype>();
            foreach (var id in dto.WasteTypeIds)
            {
                var wt = await _uow.WasteTypes.GetByIdAsync(id);
                if (wt == null)
                {
                    throw new ArgumentException($"WasteTypeId {id} is invalid");
                }
                newWasteTypes.Add(wt);
            }

            var latDelta = 0.001m;
            var lonDelta = 0.001m;

            var nearbyReports = await _uow.WasteReports.FindPotentialDuplicatesAsync(
                dto.WasteTypeIds,
                dto.Latitude,
                dto.Longitude,
                latDelta,
                lonDelta,
                reportId
            );

            var isDuplicate = nearbyReports.Any(r =>
                CalculateDistanceMeters((double)r.Latitude, (double)r.Longitude, (double)dto.Latitude, (double)dto.Longitude)
                <= DuplicateRadiusMeters
            );

            var districtId = await ResolveDistrictIdAsync(dto.Latitude, dto.Longitude);
            if (!districtId.HasValue)
            {
                throw new InvalidOperationException("This location is outside supported service districts.");
            }

            if (isDuplicate)
            {
                throw new InvalidOperationException("A similar waste report already exists in this location.");
            }

            if (!string.IsNullOrWhiteSpace(dto.Image))
            {
                report.ImageUrl = dto.Image;
            }
            report.Latitude = dto.Latitude;
            report.Longitude = dto.Longitude;
            report.Description = dto.Description;

            report.WasteTypes.Clear();
            foreach (var wt in newWasteTypes)
            {
                report.WasteTypes.Add(wt);
            }
            report.DistrictId = districtId.Value;
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

                WasteTypeIds = report.WasteTypes?.Select(wt => wt.WasteTypeId).ToList() ?? new List<int>(),
                WasteTypeNames = report.WasteTypes?.Select(wt => wt.Name).ToList() ?? new List<string>(),

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
