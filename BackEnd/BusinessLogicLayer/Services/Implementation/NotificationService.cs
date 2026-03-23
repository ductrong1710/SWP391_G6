using BusinessLogicLayer.DTOs.Notification;
using BusinessLogicLayer.Services.Interface;
using DataAccessLayer.Repositories.Interface;

namespace BusinessLogicLayer.Services.Implementation
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _uow;

        public NotificationService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _uow.Notifications.GetByUserIdAsync(userId);
            return notifications.Select(n => new NotificationDto
            {
                NotificationId = n.NotificationId,
                UserId = n.UserId,
                Content = n.Content,
                IsRead = n.IsRead ?? false,
                CreatedAt = n.CreatedAt
            });
        }

        public async Task MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _uow.Notifications.GetByIdAsync(notificationId);
            if (notification != null && notification.UserId == userId)
            {
                notification.IsRead = true;
                _uow.Notifications.Update(notification);
                await _uow.SaveChangesAsync();
            }
        }

        public async Task MarkAllAsReadAsync(int userId)
        {
            var notifications = await _uow.Notifications.GetByUserIdAsync(userId);
            var unreadNotifs = notifications.Where(n => n.IsRead == false || n.IsRead == null);

            foreach (var n in unreadNotifs)
            {
                n.IsRead = true;
                _uow.Notifications.Update(n);
            }
            await _uow.SaveChangesAsync();
        }
    }
}