import React, { useEffect, useMemo, useState } from "react";
import notificationService from "../services/notificationService";

const normalizeNotification = (item) => ({
  notificationId: item.notificationId ?? item.NotificationId ?? null,
  userId: item.userId ?? item.UserId ?? null,
  content: item.content ?? item.Content ?? "",
  isRead: item.isRead ?? item.IsRead ?? false,
  createdAt: item.createdAt ?? item.CreatedAt ?? null,
});

const NotificationBell = ({
  wrapperClassName = "",
  buttonClassName = "",
  panelClassName = "",
}) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items]
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getMyNotifications();
      setItems(Array.isArray(data) ? data.map(normalizeNotification) : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleToggle = async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setItems((prev) =>
        prev.map((item) =>
          item.notificationId === id ? { ...item, isRead: true } : item
        )
      );
    } catch (err) {
      console.error("Mark notification as read failed:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setItems((prev) => prev.map((item) => ({ ...item, isRead: true })));
    } catch (err) {
      console.error("Mark all notifications as read failed:", err);
    }
  };

  return (
    <div className={wrapperClassName} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={handleToggle}
        className={buttonClassName}
        style={{
          position: "relative",
          border: "none",
          background: "transparent",
          cursor: "pointer",
          fontSize: 20,
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -4,
              right: -6,
              minWidth: 18,
              height: 18,
              padding: "0 5px",
              borderRadius: 999,
              background: "#ef4444",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={`${panelClassName} fade-in`}
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 360,
            maxHeight: 420,
            overflowY: "auto",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              padding: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <strong>Notifications</strong>
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={!items.length}
              style={{
                border: "none",
                background: "transparent",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Mark all read
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 16, color: "#64748b" }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 16, color: "#64748b" }}>No notifications</div>
          ) : (
            items.map((item) => (
              <button
                key={item.notificationId}
                type="button"
                onClick={() => handleMarkAsRead(item.notificationId)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  background: item.isRead ? "#fff" : "#f8fafc",
                  padding: 14,
                  borderBottom: "1px solid #f1f5f9",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: item.isRead ? 500 : 700,
                    color: "#0f172a",
                    marginBottom: 6,
                  }}
                >
                  {item.content || "Notification"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {item.createdAt
                    ? new Date(item.createdAt).toLocaleString()
                    : "Unknown time"}
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
