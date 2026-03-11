using DataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;

namespace DataAccessLayer.Data;

public partial class AppDbContext : DbContext
{
    public AppDbContext()
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AiWastePrediction> AiWastePredictions { get; set; }

    public virtual DbSet<Collectionconfirmation> Collectionconfirmations { get; set; }

    public virtual DbSet<Collectionrequest> Collectionrequests { get; set; }

    public virtual DbSet<Collectorassignment> Collectorassignments { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Reward> Rewards { get; set; }

    public virtual DbSet<Rewardtransaction> Rewardtransactions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Wastereport> Wastereports { get; set; }

    public virtual DbSet<Wastetype> Wastetypes { get; set; }
    public virtual DbSet<CollectionDetail> CollectionDetails { get; set; }



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_authorization_status", new[] { "pending", "approved", "denied", "expired" })
            .HasPostgresEnum("auth", "oauth_client_type", new[] { "public", "confidential" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "oauth_response_type", new[] { "code" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS", "VECTOR" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<AiWastePrediction>(entity =>
        {
            entity.HasKey(e => e.PredictionId).HasName("ai_waste_predictions_pkey");

            entity.ToTable("ai_waste_predictions");

            entity.Property(e => e.PredictionId).HasColumnName("prediction_id");
            entity.Property(e => e.Confidence)
                .HasPrecision(5, 2)
                .HasColumnName("confidence");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.ReportId).HasColumnName("report_id");
            entity.Property(e => e.SuggestedType)
                .HasMaxLength(50)
                .HasColumnName("suggested_type");

            entity.HasOne(d => d.Report).WithMany(p => p.AiWastePredictions)
                .HasForeignKey(d => d.ReportId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("ai_waste_predictions_report_id_fkey");
        });

        modelBuilder.Entity<Collectionconfirmation>(entity =>
        {
            entity.HasKey(e => e.ConfirmationId).HasName("collectionconfirmations_pkey");

            entity.ToTable("collectionconfirmations");

            entity.HasIndex(e => e.AssignmentId, "collectionconfirmations_assignment_id_key").IsUnique();

            entity.Property(e => e.ConfirmationId).HasColumnName("confirmation_id");
            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.ConfirmedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("confirmed_at");
            entity.Property(e => e.BeforeImageUrl)
                .HasColumnType("text")
                .HasColumnName("before_image_url");
            entity.Property(e => e.AfterImageUrl)
                .HasColumnType("text")
                .HasColumnName("after_image_url");
            entity.Property(e => e.Note)
                .HasMaxLength(255)
                .HasColumnName("note");

            entity.HasOne(d => d.Assignment).WithOne(p => p.Collectionconfirmation)
                .HasForeignKey<Collectionconfirmation>(d => d.AssignmentId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("collectionconfirmations_assignment_id_fkey");
        });

        modelBuilder.Entity<Collectionrequest>(entity =>
        {
            entity.HasKey(e => e.RequestId).HasName("collectionrequests_pkey");

            entity.ToTable("collectionrequests");

            entity.HasIndex(e => e.ReportId, "collectionrequests_report_id_key").IsUnique();

            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.EnterpriseId).HasColumnName("enterprise_id");
            entity.Property(e => e.ReportId).HasColumnName("report_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Accepted'::character varying")
                .HasColumnName("status");

            entity.HasOne(d => d.Enterprise).WithMany(p => p.Collectionrequests)
                .HasForeignKey(d => d.EnterpriseId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("collectionrequests_enterprise_id_fkey");

            entity.HasOne(d => d.Report).WithOne(p => p.Collectionrequest)
                .HasForeignKey<Collectionrequest>(d => d.ReportId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("collectionrequests_report_id_fkey");
        });

        modelBuilder.Entity<Collectorassignment>(entity =>
        {
            entity.HasKey(e => e.AssignmentId).HasName("collectorassignments_pkey");

            entity.ToTable("collectorassignments");

            entity.Property(e => e.AssignmentId).HasColumnName("assignment_id");
            entity.Property(e => e.AssignedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("assigned_at");
            entity.Property(e => e.AssignedBy).HasColumnName("assigned_by");
            entity.Property(e => e.AssignedCollector).HasColumnName("assigned_collector");
            entity.Property(e => e.RequestId).HasColumnName("request_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Assigned'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.StartedAt)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("started_at");
            entity.Property(e => e.ArrivedAt)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("arrived_at");
            entity.Property(e => e.BeforeImageUrl)
                .HasColumnType("text")
                .HasColumnName("before_image_url");

            entity.HasOne(d => d.AssignedByNavigation).WithMany(p => p.CollectorassignmentAssignedByNavigations)
                .HasForeignKey(d => d.AssignedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("collectorassignments_assigned_by_fkey");

            entity.HasOne(d => d.AssignedCollectorNavigation).WithMany(p => p.CollectorassignmentAssignedCollectorNavigations)
                .HasForeignKey(d => d.AssignedCollector)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("collectorassignments_assigned_collector_fkey");

            entity.HasOne(d => d.Request).WithMany(p => p.Collectorassignments)
                .HasForeignKey(d => d.RequestId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("collectorassignments_request_id_fkey");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("feedbacks_pkey");

            entity.ToTable("feedbacks");

            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.ReportId).HasColumnName("report_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Open'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Report).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.ReportId)
                .HasConstraintName("feedbacks_report_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("feedbacks_user_id_fkey");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("notifications_pkey");

            entity.ToTable("notifications");

            entity.Property(e => e.NotificationId).HasColumnName("notification_id");
            entity.Property(e => e.Content)
                .HasMaxLength(255)
                .HasColumnName("content");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.IsRead)
                .HasDefaultValue(false)
                .HasColumnName("is_read");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("notifications_user_id_fkey");
        });

        modelBuilder.Entity<Reward>(entity =>
        {
            entity.HasKey(e => e.RewardId).HasName("rewards_pkey");

            entity.ToTable("rewards");

            entity.Property(e => e.RewardId).HasColumnName("reward_id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(100)
                .HasColumnName("name");
            entity.Property(e => e.Points).HasColumnName("points");
            entity.Property(e => e.Status)
                .HasDefaultValue(true)
                .HasColumnName("status");
        });

        modelBuilder.Entity<Rewardtransaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId).HasName("rewardtransactions_pkey");

            entity.ToTable("rewardtransactions");

            entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.RewardId).HasColumnName("reward_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Type)
                .HasMaxLength(10)
                .HasDefaultValue("redeem")
                .HasColumnName("type");
            entity.Property(e => e.Points)
                .HasDefaultValue(0)
                .HasColumnName("points");
            entity.Property(e => e.Description)
                .HasColumnType("text")
                .HasColumnName("description");
            entity.Property(e => e.ReportId)
                .HasColumnName("report_id");

            entity.HasOne(d => d.Reward).WithMany(p => p.Rewardtransactions)
                .HasForeignKey(d => d.RewardId)
                .HasConstraintName("rewardtransactions_reward_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Rewardtransactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("rewardtransactions_user_id_fkey");


        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("roles_pkey");

            entity.ToTable("roles");

            entity.HasIndex(e => e.RoleName, "roles_role_name_key").IsUnique();

            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.RoleName)
                .HasMaxLength(30)
                .HasColumnName("role_name");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.Phone, "users_phone_key").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .HasColumnName("email");
            entity.Property(e => e.Password)
               .HasMaxLength(255)
               .HasColumnName("password");
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .HasColumnName("full_name");
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .HasColumnName("phone");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Active'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.TotalPoints)
                .HasDefaultValue(0)
                .HasColumnName("total_points");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("users_role_id_fkey");
        });

        modelBuilder.Entity<Wastereport>(entity =>
        {
            entity.HasKey(e => e.ReportId).HasName("wastereports_pkey");

            entity.ToTable("wastereports");

            entity.Property(e => e.ReportId).HasColumnName("report_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Description)
                .HasMaxLength(500)
                .HasColumnName("description");
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("image_url");
            entity.Property(e => e.Latitude)
                .HasPrecision(10, 7)
                .HasColumnName("latitude");
            entity.Property(e => e.Longitude)
                .HasPrecision(10, 7)
                .HasColumnName("longitude");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.SubmittedBy).HasColumnName("submitted_by");

            entity.HasOne(d => d.SubmittedByNavigation).WithMany(p => p.Wastereports)
                .HasForeignKey(d => d.SubmittedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("wastereports_submitted_by_fkey");

            entity.HasMany(d => d.WasteTypes)
                .WithMany(p => p.Reports)
                .UsingEntity<Dictionary<string, object>>(
                    "report_waste_types",
                    j => j.HasOne<Wastetype>().WithMany().HasForeignKey("waste_type_id"),
                    j => j.HasOne<Wastereport>().WithMany().HasForeignKey("report_id")
                );
        });

        modelBuilder.Entity<Wastetype>(entity =>
        {
            entity.HasKey(e => e.WasteTypeId).HasName("wastetypes_pkey");

            entity.ToTable("wastetypes");

            entity.Property(e => e.WasteTypeId).HasColumnName("waste_type_id");

            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Name)
                .HasMaxLength(50)
                .HasColumnName("name");
            entity.Property(e => e.RewardPoints)
                .HasDefaultValue(0)
                .HasColumnName("reward_points");

            entity.Property(e => e.IsActive)
                .HasDefaultValue(true)
                .HasColumnName("is_active");
        });

        modelBuilder.Entity<CollectionDetail>(entity =>
        {
            entity.HasKey(e => e.DetailId).HasName("collection_details_pkey");

            entity.ToTable("collection_details");

            entity.Property(e => e.DetailId).HasColumnName("detail_id");
            entity.Property(e => e.ConfirmationId).HasColumnName("confirmation_id");
            entity.Property(e => e.WasteTypeId).HasColumnName("waste_type_id");
            entity.Property(e => e.ActualWeight).HasColumnName("actual_weight");

            entity.HasOne(d => d.Confirmation)
                  .WithMany(p => p.CollectionDetails)
                  .HasForeignKey(d => d.ConfirmationId)
                  .OnDelete(DeleteBehavior.ClientSetNull)
                  .HasConstraintName("collection_details_confirmation_id_fkey");

            entity.HasOne(d => d.WasteType)
                  .WithMany(p => p.CollectionDetails)
                  .HasForeignKey(d => d.WasteTypeId)
                  .OnDelete(DeleteBehavior.ClientSetNull)
                  .HasConstraintName("collection_details_waste_type_id_fkey");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
