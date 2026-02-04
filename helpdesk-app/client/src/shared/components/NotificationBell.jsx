import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom'; // Import Link for navigation

const NotificationBell = () => {
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null); // Ref for click outside detection

  // Fetch unread count on mount and set up polling
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Click outside handler for closing the panel
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('/api/v1/notifications/unread-count');
      // Safeguard against undefined response.data or response.data.data
      if (response.status === 200 && response.data && typeof response.data.data === 'object' && typeof response.data.data.count === 'number') {
        setUnreadCount(response.data.data.count);
      } else if (response.status === 304) {
        // If 304 Not Modified, the content hasn't changed. We can keep the current count.
        // Or, for robustness, you might want to re-fetch if this is critical.
        console.warn('Frontend: Unread count response 304 Not Modified, using current count.');
      }
       else {
        console.error('Frontend: Unexpected response structure for unread-count:', response);
        setUnreadCount(0); // Default to 0 on unexpected response
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      setUnreadCount(0); // Default to 0 on error
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/v1/notifications');
      // Safeguard against undefined response.data or response.data.data
      if (response.status === 200 && response.data && typeof response.data.data === 'object' && Array.isArray(response.data.data.notifications)) {
        setNotifications(response.data.data.notifications);
      } else if (response.status === 304) {
         // If 304 Not Modified, assume no new notifications to display
        console.warn('Frontend: Notifications response 304 Not Modified, assuming no new notifications.');
        setNotifications([]);
      }
      else {
        console.error('Frontend: Unexpected response structure for notifications:', response);
        setNotifications([]); // Default to empty array on unexpected response
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]); // Default to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = async () => {
    if (!showPanel) {
      await fetchNotifications();
    }
    setShowPanel(!showPanel);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/v1/notifications/${notificationId}/read`);
      // Update local state without refetching all notifications for better UX
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1)); // Decrement count
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await axios.delete(`/api/v1/notifications/${notificationId}`);
      // Remove from local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      fetchUnreadCount(); // Re-fetch unread count as deleted might have been unread
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put('/api/v1/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showPanel && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-slate-400 hover:text-slate-600"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-slate-500">No notifications</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {notifications.map((notif) => (
                  <li
                    key={notif._id}
                    className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                      notif.isRead ? 'bg-white' : 'bg-blue-50'
                    }`}
                  >
                    <Link to={`/tickets/${notif.ticketId}`} onClick={() => {
                        handleMarkAsRead(notif._id);
                        setShowPanel(false); // Close panel on click
                    }} className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold text-slate-900">
                          {notif.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1">
                          {notif.message}
                        </p>
                        <small className="text-xs text-slate-400 mt-2 block">
                          {new Date(notif.createdAt).toLocaleString()}
                        </small>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 items-center">
                        {!notif.isRead && (
                          <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleMarkAsRead(notif._id); }}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded text-xs leading-none"
                            title="Mark as read"
                          >
                            ✓
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteNotification(notif._id); }}
                          className="p-1 text-red-600 hover:bg-red-100 rounded text-xs leading-none"
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-100 text-center">
              <button onClick={handleMarkAllAsRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;