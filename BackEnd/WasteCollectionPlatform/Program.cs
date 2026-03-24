using BusinessLogicLayer;
using DataAccessLayer;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Localization;
using Microsoft.IdentityModel.Tokens;
using System.Globalization;
using System.Security.Claims;
using System.Text;

namespace WasteCollectionPlatform
{
    public class Program
    {
        public static void Main(string[] args)
        {
            AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
            var builder = WebApplication.CreateBuilder(args);

            // Force invariant culture để parse số thập phân theo dấu "."
            var invariantCulture = CultureInfo.InvariantCulture;
            CultureInfo.DefaultThreadCurrentCulture = invariantCulture;
            CultureInfo.DefaultThreadCurrentUICulture = invariantCulture;

            builder.Services.Configure<RequestLocalizationOptions>(options =>
            {
                options.DefaultRequestCulture = new RequestCulture(invariantCulture);
                options.SupportedCultures = new[] { invariantCulture };
                options.SupportedUICultures = new[] { invariantCulture };
            });

            // 1. Cấu hình DB Context
            builder.Services.AddMemoryCache();
            builder.Services.AddDataAccessLayer(builder.Configuration);
            builder.Services.AddBusinessLogicLayer(builder.Configuration);
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"])),
                    RoleClaimType = ClaimTypes.Role
                };
            });

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            // Cấu hình Swagger để nhập Token test cho tiện
            builder.Services.AddSwaggerGen(c =>
            {
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);

                c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "Nhập JWT token",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
                    Scheme = "bearer",
                    BearerFormat = "JWT"
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        Array.Empty<string>()
                    }
                });
            });

            // CORS: cho phép frontend (Vite) truy cập API
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    if (builder.Environment.IsDevelopment())
                    {
                        // Development: cho phép origin dev server (vite) and allow any origin to avoid http/https mismatch
                        policy
                            .AllowAnyOrigin()
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .WithExposedHeaders("WWW-Authenticate");
                    }
                    else
                    {
                        // Production: giới hạn origin
                        policy
                            .WithOrigins(
                                "https://your-production-frontend.example"
                            )
                            .AllowAnyHeader()
                            .AllowAnyMethod()
                            .AllowCredentials()
                            .WithExposedHeaders("WWW-Authenticate");
                    }
                });
            });

            var app = builder.Build();

            // Áp dụng localization (culture) cho request pipeline
            app.UseRequestLocalization();

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // IMPORTANT: place CORS before static files/auth so preflight is handled and header is present
            app.UseCors("AllowReactApp");

            app.UseStaticFiles();

            // 3. Kích hoạt Middleware (Thứ tự rất quan trọng!)
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            // Warm-up: pre-load dashboard cache on startup
            _ = Task.Run(async () =>
            {
                try
                {
                    using var scope = app.Services.CreateScope();
                    var dashboard = scope.ServiceProvider.GetRequiredService<BusinessLogicLayer.Services.Interface.IDashboardService>();
                    await dashboard.GetAdminDashboardAsync(DateTime.Now.Year);
                    Console.WriteLine("✅ Dashboard cache warmed up successfully");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"⚠️ Dashboard warm-up failed: {ex.Message}");
                }
            });

            app.Run();
        }
    }
}