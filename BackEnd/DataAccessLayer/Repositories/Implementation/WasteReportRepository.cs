using DataAccessLayer.Data;
using DataAccessLayer.Models;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer.Repositories.Implementation
{
    public class WasteReportRepository
        : GenericRepository<Wastereport>, IWasteReportRepository
    {
        public WasteReportRepository(AppDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Wastereport>> GetPendingReportsAsync()
        {
            return await _dbSet
                .Include(r => r.SubmittedByNavigation)
                .Include(r => r.WasteType)
                .Where(r => r.Status == "Pending")
                .ToListAsync();
        }
    }

}
