namespace BusinessLogicLayer.DTOs.User
{
    public class UserResponseDto
    {
        public int UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime? CreatedAt { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime? AvailabilityUpdatedAt { get; set; }

    }
}
