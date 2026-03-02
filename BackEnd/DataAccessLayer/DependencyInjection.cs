using DataAccessLayer.Data;
using DataAccessLayer.Repositories.Implementation;
using DataAccessLayer.Repositories.Interface;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DataAccessLayer
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddDataAccessLayer(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // DbContext (PostgreSQL)
            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

            // UnitOfWork
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Repositories
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
            // Sau này thêm các repository khác: IWasteReportRepository, IRewardRepository,...
            services.AddScoped<IWasteTypeRepository, WasteTypeRepository>();
            services.AddScoped<IWasteReportRepository, WasteReportRepository>();
            services.AddScoped<ICollectionRequestRepository, CollectionRequestRepository>();
            services.AddScoped<ICollectorAssignmentRepository, CollectorAssignmentRepository>();
            services.AddScoped<ICollectionConfirmationRepository, CollectionConfirmationRepository>();

            return services;
        }
    }
}
