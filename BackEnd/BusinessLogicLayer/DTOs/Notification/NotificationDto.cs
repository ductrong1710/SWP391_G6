namespace BusinessLogicLayer.DTOs.Notification
{
    public class NotificationDto
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsRead { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}