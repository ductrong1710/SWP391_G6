namespace BusinessLogicLayer.DTOs.User
{
    public class UpdateProfileRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        
        // Bạn có thể thêm Address, City, ZipCode vào đây 
        // sau khi đã thêm chúng vào file Models/User.cs và Database nhé!
    }
}