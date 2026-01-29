using BusinessLogicLayer.Identity;
using BusinessLogicLayer.Services.Implementation;
using BusinessLogicLayer.Services.Interface;
using BusinessLogicLayer.Services.Service;
using BusinessLogicLayer.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace BusinessLogicLayer
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddBusinessLogicLayer(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IAuthService, AuthService>();
            // sau này: IAuthService, IRewardService, IReportService,...
            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssemblyContaining<CreateUserValidator>();
            services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
            services.AddScoped<IEmailService, EmailService>();
            services.Configure<EmailSettings>(configuration.GetSection("EmailSettings"));
            services.AddScoped<IWasteReportService, WasteReportService>();

            return services;
        }
    }
}
