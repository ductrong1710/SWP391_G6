namespace BusinessLogicLayer.DTOs.User
{
    public class CreateUserRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public int? ManagedDistrictId { get; set; }
        public int? EnterpriseId { get; set; }

    }
}
